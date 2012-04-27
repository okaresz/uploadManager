var MultiFileUpload = new Class(
{
	Implements: Options,

 	options: {
		maxFileCount: 3,
  		addFileLinktext: ' +',
  		removeFileLinktext: ' -',
		wrapElement: null,
  		insertBetween: new Element( 'br' )
	},

 	rootElement: null,
	fileCount: 1,	//root element is already one
 	removeLinks: [],	//used in resetMultiFileUpload

	initialize: function( fileInputElement, options )
	{
		this.setOptions(options);
		this.rootElement = $(fileInputElement);
		this.rootElement.store( 'multiFileUpload', true );
		this.createAddFileLinkElement().inject( this.rootElement, 'after' );

		Object.append( this.rootElement,
  		{
			resetMultiFileUpload: function()
			{
				this.removeLinks.each( function(rLink) {
					rLink.fireEvent( 'click' );
				} );
				var rootAddFileLink = this.rootElement.getNext('.addNewFileUploadLink');
				if( rootAddFileLink )
					{ rootAddFileLink.dispose(); }
			}.bind(this)
		} );
	},

 	createFileInputElement: function( attributes )
	{
		var newElement = this.rootElement.clone();
		newElement.set( 'value', '' );
		if( attributes )
			{ newElement.setProperties(attributes); }
		return newElement;
	},

 	createAddFileLinkElement: function()
	{
		var linkElement = new Element( 'a', {
			class: 'addNewFileUploadLink',
   			href: '#',
	  		title: 'add new file',
	 		text: this.options.addFileLinktext
		} )
		linkElement.addEvent( 'click', this.addNewFileInput.bind(this).pass(linkElement) );
		return linkElement;
	},

 	createRemoveFileLink: function( elementsToRemove )
	{
		var linkElement = new Element( 'a', {
			class: 'removeFileUploadLink',
   			href: '#',
	  		title: 'remove this file',
	 		text: this.options.removeFileLinktext
		} );
		elementsToRemove.push(linkElement);
		linkElement.addEvent( 'click', function(els)
		{
			elementsToRemove.each( function(el){ el.dispose(); } );
			this.fileCount--;
		}.bind(this).pass(elementsToRemove) );
		this.removeLinks.push(linkElement);
		return linkElement;
	},

 	addNewFileInput: function( afterThisElement )
	{
		if( this.fileCount >= this.options.maxFileCount )
		{
			alert( 'You can only upload '+this.options.maxFileCount+' files!' );
			return;
		}
		this.fileCount++;
		if( this.fileCount > 1 && !this.rootElement.get('name').contains('[]') )
		{
			this.rootElement.set('name', this.rootElement.get('name')+'[]' );
		}

		var newElements = [];

		var newInputElement = this.createFileInputElement();
		newInputElement.inject( afterThisElement, 'after' );
		newElements.push(newInputElement);

		if( this.options.insertBetween )
		{
			var newBetweenElement = this.options.insertBetween.clone();
			newBetweenElement.inject( newInputElement, 'before' );
			newElements.push(newBetweenElement);
		}
		if( this.options.wrapElement )
		{
			var newWrapElement = this.options.wrapElement.clone();
			newWrapElement.grab( newInputElement );
			newElements.push(newWrapElement);
		}

		var newAddFileLink = this.createAddFileLinkElement();
		newAddFileLink.inject( newInputElement, 'after' );
		newElements.push(newAddFileLink);

		var newRemoveFileLink = this.createRemoveFileLink( newElements );
		newRemoveFileLink.inject( newInputElement, 'after' );
	}
});

var MootoolsUploadManagerWrapper = new Class(
{
	options: {
		base: 'php/upload.php',

  		//if this is false, the action specified in the HTML script is left as is
  		formAction: 'php/handleupload.php',

		//action to use when falling back to legacy file upload.
		//Can be the same as formAction.
		//If this is false, formAction is used for legacy as well.
		legacyFormAction: 'php/legacyupload.php',

		//you cannot upload more than 3 files
		limit: 3,

		//show the pause/resume upload by default if the browser can handle that otherwise show only on error
		pause: true,

		enqueue: true,

		//each file size must be less than 2.5Mb
		filesize: 2621440,

		//total files size must not exceed 3.5Mb
		maxsize: 3670016,

		//use iframe
		iframe: false,

		//prefix for upload container id
		container: 'upload',

		//upload container class
  		containerClass: 'mtUploadDragDropBox',

		//wrapper div class
		wrapperDivClass: 'mtUploadManager',

		//filter uploaded file type
		//filetype: 'html,rar,zip',

  		//class of file type inputs to onvert to mootools Uploader
  		mootoolsFileInputClass: 'mootoolsUploader',

		//This array will be in the $_POST data containing all the info of the files uploaded with uploadManager
		postArrayName: 'uploadManagerFiles',

		//upload field name
		/// @deprecated Name is parsed from the replaced file input field
		//name: 'alias',

		multiple: true, //enable multiple selection in file dialog

		progressbar: {

			width: 140, //fix the progressbar width
			color: '#000',
			fillColor: '#fff',
			text: 'Pending...',
			onChange: function (value, progressbar) {

				//console.log(arguments)
				progressbar.setText('completed: ' + (100 * value).format() + '%')
			}
		},
	/*

		onCreate: function (transfer) {

			//do something
		},
	*/
		onAbort: function (object) {

			alert('Upload aborted:\n' + object.message)
		},
		onCancel: function (obj) {

			//upload size
			$(this.options.container+'_infos').set('html', uploadManager.getSize(this.options.container).toFileSize());
			if(obj.message) alert('Upload cancelled:\n' + obj.message);

		},
		onSuccess: function (infos) {

			//upload size
			$(this.options.container+'_infos').set('html', uploadManager.getSize(this.options.container).toFileSize());
			//console.log(infos.file);
			//download link
			new Element('span', {html: '<a href="'+this.options.base+'?' + infos.path + '&dl=1&filename=' + infos.file + '">download</a> -&nbsp;'}).inject($(infos.transfer).getElement('a'), 'before')
		},
		onFailure: function (transfer) {

			alert( 'Failure' );
			console.debug(transfer);

		},
		onAllComplete: function (container) {

			var message = 'all transfers completed for "' + container + '"';

			if(window.console && console.log) console.log(message);
			else alert(message);
		}
	},

 	instanceCount: 0,

 	initialize: function()
	{
		$$('form').each( function(formEl)
		{
			var mtFileInputs = formEl.getElements( 'input[type=file].'+this.options.mootoolsFileInputClass );
			//console.debug(mtFileInputs);return;
			if( mtFileInputs.length > 0 )
			{
				for( i in mtFileInputs )
				{
					if( !$(mtFileInputs[i]) ) continue;
					this.replaceFileInput( $(mtFileInputs[i]) );
				}

				if( this.options.formAction && !this.legacyUploadExists(formEl) )
					{ formEl.set( 'action', this.options.formAction ); }
			}
		}.bind(this) );
	},

 	replaceFileInput: function( inputElement )
	{
		this.instanceCount++;
		var instanceOptions = Object.clone( this.options );
		instanceOptions.name = inputElement.get('name');
		if( instanceOptions.limit > 1 && !instanceOptions.name.contains('[]') )
		{
			//instanceOptions.name += '[]';
		}
		if( inputElement.get('id') )
			{ instanceOptions.container = instanceOptions.container + '_' + inputElement.get('id'); }
		else
			{ instanceOptions.container = instanceOptions.container + '_' + this.instanceCount; }
		var managerDOM = this.createFormDOM( instanceOptions );
		managerDOM.inject( inputElement, 'after' );

		//dispose useLegacyLink if exists
		var useLegacyLinkElement = inputElement.getNext('.useMtUploadLink');
		if( useLegacyLinkElement )
			{ useLegacyLinkElement.dispose(); }

		if( inputElement.retrieve('multiFileUpload') )
		{
			inputElement.resetMultiFileUpload();
		}
		managerDOM.store( 'legacyDOM', inputElement.dispose() );

		uploadManager.attachDragEvents(instanceOptions.container, instanceOptions);
		$(instanceOptions.container+'_uploadLink').addEvent('click', function(e) {
			e.stop();
			uploadManager.upload( instanceOptions );
		});

		//search for the form and change the action to formAction if there's no legacy file input in the form
		var parentForm = managerDOM.getParent('form');
		if( parentForm && !this.legacyUploadExists(parentForm) )
			{ parentForm.set('action', this.options.formAction); }
	},

	createFormDOM: function( instanceOptions )
	{
		var wrapperElement = new Element( 'div', {class: instanceOptions.wrapperDivClass } );
		var uploadLinkElement = new Element( 'div', {class: 'upload-link', html: ' [upload size: <span id="'+instanceOptions.container+'_infos">0</span>]'} ).grab(
				new Element( 'a', {id: instanceOptions.container+'_uploadLink', href: '#', text: 'Upload a file'} ), 'top' );
		var dragDropBoxElement = new Element( 'div', {id: instanceOptions.container, class: instanceOptions.containerClass} );
		var useLegacyLinkElement = new Element( 'a', {href: '#', class: 'useLegacyLink', text: 'Use legacy upload'} );
		useLegacyLinkElement.addEvent( 'click', this.backToLegacy.bind(this).pass(wrapperElement) );
		var useLegacyElement = new Element( 'div', {class: 'useLegacyDiv'} ).grab( useLegacyLinkElement );

		uploadLinkElement.inject( wrapperElement );
		dragDropBoxElement.inject( wrapperElement, 'bottom' );
		useLegacyElement.inject( wrapperElement, 'bottom' );

		return wrapperElement;
	},

	backToLegacy: function( uploadManagerElement )
	{
		var legacyDOM = uploadManagerElement.retrieve( 'legacyDOM' );
		legacyDOM.replaces( uploadManagerElement );
		new Element( 'a', {class: 'useMtUploadLink', href: '#', text: 'Use HTML5 upload', events: { click: this.replaceFileInput.bind(this).pass(legacyDOM) }} ).inject( legacyDOM, 'after' );
		if( MultiFileUpload )
			{ new MultiFileUpload(legacyDOM); }

		//search for the form and change back the action attribute
		legacyDOM.getParent('form').set('action', this.options.legacyFormAction);
	},

 	legacyUploadExists: function( formElement )
	{
		return formElement.getElements( 'input[type=file]' ).length;
	}
});

window.addEvent('domready', function() {
	new MootoolsUploadManagerWrapper();

	$$('input[type=file]').each( function(fileInput)
	{
		if( !fileInput.hasClass('mootoolsUploader') )
			{ new MultiFileUpload( fileInput ); }
	} );
});
