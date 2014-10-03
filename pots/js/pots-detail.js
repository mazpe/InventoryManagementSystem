/**
 * @author Greivin Britton
 */

var topAnchor = '95%';
var name = null;
var cost = null;
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
		url: "/pots/php/pots_data.php",		
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
		            fieldLabel: 'Name',
		            width:300,
		            name: 'name',
					allowBlank: false,
		            value: ''
		        }),		        
		        desc = new Ext.form.TextField(
		        {
		            fieldLabel: 'Description',
		            width:300,
		            name: 'desc',
					allowBlank:true,
		            value: ''
		        }),
		        cost = new Ext.form.NumberField(
		        {
		            fieldLabel: 'Cost',
		            width:300,
		            name: 'cost',
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
	    title: 'New Pots',
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
		name: name.getValue(), 
		desc: desc.getValue(),
		cost: cost.getValue(),
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