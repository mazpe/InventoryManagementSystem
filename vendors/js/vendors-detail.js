/**
 * @author Greivin Britton
 */

var topAnchor = '95%';
var vendor_name = null;
var vendor_prefer_type = null;
var vendor_phone = null;
var vendor_fax = null;
var currentRow = null;
var formPanel = null;
var dialog = null;

function createDialog()
{
	formPanel = new Ext.form.FormPanel(
	{				
	    bodyStyle:'padding:0px',		
		method:'post',
		url: "/vendors/php/vendors_data.php",		
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
	            vendor_name = new Ext.form.TextField(
	            {
		            fieldLabel: 'Name',
		            width:300,
		            name: 'vendor_name',
		            value: ''
		        }),
		        vendor_prefer_type = new Ext.form.ComboBox(
		        {
		            fieldLabel: 'Prefer Type',
		            width:300,
		            name: 'vendor_prefer_type',		            										
		            store			: dsVendorType, 
		            displayField	: 'type_name',
		        	valueField		: 'id',
		        	editable		: false,
		        	forceSelection 	: true,
		        	allowBlank		: false,
		        	lazyRender		: true,
		        	mode			: 'local',
		        	fieldLabel		: 'Prefer Type',
		            triggerAction	: 'all',
		            emptyText		: 'Select a Vendor Type...',
		            selectOnFocus	: true			            
		        }),
		        vendor_phone = new Ext.form.TextField(
		        {
		            fieldLabel: 'Phone',
		            width:300,
		            name: 'vendor_phone',
		            value: ''
		        }),
		        vendor_fax = new Ext.form.TextField(
		        {
		            fieldLabel: 'Fax',
		            width:300,
		            name: 'vendor_fax',
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
	    title: 'New Vendor',
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
		vendor_name: vendor_name.getValue(), 
		vendor_prefer_type: vendor_prefer_type.getValue(),
		vendor_phone: vendor_phone.getValue(),
		vendor_fax: vendor_fax.getValue(),
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