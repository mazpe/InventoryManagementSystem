/**
 * @author Greivin Britton
 */

var topAnchor = '95%';
var name = null;
var cost = null;
var currentRow = null;
var formPanel = null;
var dialog = null;

function createDialog()
{
	formPanel = new Ext.form.FormPanel(
	{				
	    bodyStyle:'padding:0px',		
		method:'post',
		url: "/soils/php/soils_data.php",		
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
		            value: ''
		        }),
		        vendor = new Ext.form.ComboBox(
		        {
		        	fieldLabel: 'Vendor',
		            store			: dsVendor, 
		            displayField	: 'vendor_name',
		        	valueField		: 'id',
		        	editable		: false,
		        	forceSelection 	: true,
		        	allowBlank		: false,
		        	lazyRender		: true,
		        	mode			: 'local',
		        	fieldLabel		: 'Vendor',
		            triggerAction	: 'all',
		            emptyText		: 'Select a Vendor...',
		            selectOnFocus	: true		            
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
	    title: 'New Soils',
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
		vendor_id: vendor.getValue(),
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