/**
 * @author Greivin Britton
 */

var topAnchor = '95%';
var template = null;
var plant = null;
var size = null;
var days = null;
var currentRow = null;
var formPanel = null;
var dialog = null;

function createDialog()
{
	formPanel = new Ext.form.FormPanel(
	{				
	    bodyStyle:'padding:0px',		
		method:'post',
		url: "/templates/php/templates_data.php",		
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
				template = new Ext.form.TextField(
		        {
		        	fieldLabel: 'Template',
		            width:300,
		            name: 'template',
		            value: ''		            
		        }),
		        plant = new Ext.form.TextField(
		        {
		            fieldLabel: 'Plant',
		            width:300,
		            name: 'plant',
		            value: ''
		        }),
	            size = new Ext.form.ComboBox(
	            {
					fieldLabel: 'Sixe',
		            store			: dsSize, 
		            displayField	: 'name',
		        	valueField		: 'id',
		        	editable		: false,
		        	forceSelection 	: true,
		        	allowBlank		: false,
		        	lazyRender		: true,
		        	mode			: 'local',
		        	fieldLabel		: 'Size',
		            triggerAction	: 'all',
		            emptyText		: 'Select a Size...',
		            selectOnFocus	: true		
		        }),		        
		        days = new Ext.form.NumberField(
		        {
		            fieldLabel: 'Days',
		            width:300,
		            name: 'days',
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
	    title: 'New Template',
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
	currentRow.set('template', template.getValue());
	currentRow.set('plant', plant.getValue());
	currentRow.set('size', size.getValue());
	currentRow.set('days', days.getValue());
	
	dialog.hide();			
}

function showDetail(row)
{
	if(formPanel == null)
		createDialog();
	
	currentRow = row;
	
	var data = row.data;
	
	template.setValue(data.template);
	plant.setValue(data.plant);
	size.setValue(data.size);
	days.setValue(data.days);
	
	dialog.show();
}