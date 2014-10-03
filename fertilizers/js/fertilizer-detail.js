/**
 * @author Greivin Britton
 */

var topAnchor = '95%';
var name = null;
var vendor_id = null;
var days = null;
var cost = null;
var next = null;
var currentRow = null;
var formPanel = null;
var dialog = null;

function createDialog()
{
	formPanel = new Ext.form.FormPanel(
	{				
	    bodyStyle:'padding:0px',		
		method:'post',
		url: "/fertilizers/php/fertilizers_data.php",		
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
		        vendor_id = new Ext.form.ComboBox(
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
		            triggerAction	: 'all',
		            emptyText		: 'Select a Vendor...',
		            selectOnFocus	: true		            
		        }),
		        days = new Ext.form.NumberField(
		        {
		            fieldLabel: 'Days',
		            width:300,
		            name: 'days',
		            value: ''
		        }),
		        cost = new Ext.form.NumberField(
		        {
		            fieldLabel: 'Cost',
		            width:300,
		            name: 'cost',
		            value: ''
		        }),
				bagCost = new Ext.form.NumberField(
		        {
		            fieldLabel: 'Bag Cost',
		            width:300,
		            name: 'bag_cost',
		            value: ''
		        }),
				gramsPerPot = new Ext.form.NumberField(
		        {
		            fieldLabel: 'Grams per Pot',
		            width:300,
		            name: 'grams_per_pot',
		            value: ''
		        }),
		        next = new Ext.form.ComboBox(
		        {
		        	fieldLabel: 'Next Fertilizers',
		            store			: dsFert, 
		            displayField	: 'name',
		        	valueField		: 'id',
		        	editable		: false,
		        	forceSelection 	: true,
		        	allowBlank		: false,
		        	lazyRender		: true,
		        	mode			: 'local',		        	
		            triggerAction	: 'all',
		            emptyText		: 'Select a Fertilizers...',
		            selectOnFocus	: true		            
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
	    title: 'New Fertilizer',
	    width: 500,
	    height:250,
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
		id         : 0, 
		name       : name.getValue(), 
		vendor_id  : vendor_id.getValue(),
		days 	   : days.getValue(),
		cost       : cost.getValue(),
		bag_cost       : bagCost.getValue(),
		grams_per_pot       : gramsPerPot.getValue(),
		next  	   : next.getValue(),
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