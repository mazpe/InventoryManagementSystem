/**
 * @author Greivin Britton
 */

var topAnchor = '95%';
var name = null;
var desc = null;
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
		url: "/labor/php/labor_data.php",		
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
	            job = new Ext.form.ComboBox(
	            {
					fieldLabel: 'Job',
		            store			: dsJob, 
		            displayField	: 'name',
		        	valueField		: 'id',
		        	editable		: false,
		        	forceSelection 	: true,
		        	allowBlank		: false,
		        	lazyRender		: true,
		        	mode			: 'local',
		        	fieldLabel		: 'Job',
		            triggerAction	: 'all',
		            emptyText		: 'Select a Job...',
		            selectOnFocus	: true		
		        }),
		        name = new Ext.form.TextField(
		        {
		        	fieldLabel: 'Name',
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
	    title: 'New Labor',
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
		job_id: job.getValue(), 
		name: name.getValue(),
		desc:desc.getValue(),
		cost:cost.getValue(),
		insert:true
	});
	dsData.add(record);
	
	/*currentRow.set('job_id', job.getValue());
	currentRow.set('name', name.getValue());
	currentRow.set('desc', desc.getValue());
	currentRow.set('cost', cost.getValue());*/
	
	dialog.hide();	
	formPanel.getForm().reset();
}

function showDetail(row)
{
	if(formPanel == null)
		createDialog();
	/*

	currentRow = row;
	
	var data = row.data;
	
	job.setValue(data.job_id);
	name.setValue(data.name);
	desc.setValue(data.desc);
	cost.setValue(data.cost);
	
*/    	
	dialog.show();
}