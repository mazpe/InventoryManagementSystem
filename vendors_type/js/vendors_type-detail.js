/**
 * @author Greivin Britton
 */

var topAnchor = '95%';
var name = null;
var desc = null;
var currentRow = null;
var formPanel = null;
var dialog = null;

function createDialog()
{
	formPanel = new Ext.form.FormPanel(
	{				
	    bodyStyle:'padding:0px',		
		method:'post',
		url: "/vendors_type/php/vendors_type_data.php",		
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
				type_name = new Ext.form.TextField(
	            {
		            fieldLabel: 'Name',
		            width:300,
		            name: 'name',
					allowBlank:false,
		            value: ''
		        })]
	        }]
	    }]
	});


	formPanel.on("actioncomplete", function(t, a) 
	{			
		alert('Your changes were saved!');
		
		formPanel.getForm().reset();
	});

	dialog = new Ext.Window({
	    title: 'New Vendor Type',
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
		id:0, 
		type_name: type_name.getValue(),			
		insert:true
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