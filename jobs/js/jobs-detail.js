/**
 * @author Greivin Britton
 */

var topAnchor = '95%';
var name = null;
var desc = null;
var type = null;
var ref = null;
var currentRow = null;
var formPanel = null;
var dialog = null;

function createDialog()
{
	formPanel = new Ext.form.FormPanel(
	{				
	    bodyStyle:'padding:0px',		
		method:'post',
		url: "/jobs/php/jobs_data.php",		
	    items: [
		{
	        layout:'column',
	        border:false,
			labelAlign:'right',
			bodyStyle:'padding:5px',			
	        items:[
	        {
	            columnWidth:1,
	            layout: 'form',
	            border:false,				
	            items: [
	            name = new Ext.form.TextField(
	            {
		            fieldLabel: 'Job Name',
		            width:300,
		            name: 'name', 
		            value: ''
		        }),
			    desc = new Ext.form.TextField(
	            {
		            fieldLabel: 'Description',
		            width:300,
		            name: 'desc',
		            value: ''
		        }),
		        type = new Ext.form.ComboBox(
		        {
		            fieldLabel: 'Type',
		            width:300,
		            name: 'type',		            					
		            store			: dsJobsType, 	
					displayField	: 'name',	            
		        	valueField		: 'id',
		        	editable		: false,
		        	forceSelection 	: true,
		        	allowBlank		: false,
		        	lazyRender		: true,
		        	mode			: 'local',
		        	fieldLabel		: 'Type',
		            triggerAction	: 'all',
		            emptyText		: 'Select a type...',
		            selectOnFocus	: true
		        }),
				ref = new Ext.form.TextField(
		        {
		            fieldLabel: 'Ref',
		            width:300,
		            name: 'ref',
		            value: ''
		        })				
				]
	        }]
		 }]
	});


	formPanel.on("actioncomplete", function(t, a) 
	{			
		alert('Your changes were saved!');
		
		formPanel.getForm().reset();
	});

	dialog = new Ext.Window({
	    title: 'New Jobs',
	    width: 500,
	    height:200,
	    layout: 'fit',
	    plain:true,
		closeAction :'hide',
		modal:true,
	    bodyStyle:'padding:5px;',
	    buttonAlign:'center',
	    items: formPanel,
	    buttons: [
		{
	        text: 'Save',
			handler: setValues
	    },
		{
	        text: 'Close',
			handler  : function()
			{
	        	dialog.hide();
	        }
	    }]
	});
}

function setValues()
{
	var record = new Ext.data.Record(
	{
		id     : 0, 
		name   : name.getValue(), 
		desc   : desc.getValue(),
		type   : type.getValue(),
		ref    : ref.getValue(),
		insert : true
	});
	
	dsData.add(record);
	dialog.hide();	
	formPanel.getForm().reset();		
}

function showDetail(row)
{
	if(formPanel == null)
		createDialog();
	
	dialog.show();
}