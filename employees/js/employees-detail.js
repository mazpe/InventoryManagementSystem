/**
 * @author Greivin Britton
 */

var topAnchor = '95%';
var name = null;
var vendor_id = null;
var days = null;
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
		url: "/employees/php/employees_data.php",		
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
	            full_name = new Ext.form.TextField(
	            {
		            fieldLabel: 'Full Name',
		            width:300,
		            name: 'full_name',
		            value: ''
		        }),
				hire_date = new Ext.form.DateField(
		        {
					fieldLabel: 'Hire Date',
		            width:300,
		            name: 'hire_date',										
				    format: 'm/d/y'
				}),
		        title = new Ext.form.TextField(
		        {
		            fieldLabel: 'Title',
		            width:300,
		            name: 'title',
		            value: ''
		        }),
		        salary = new Ext.form.NumberField(
		        {
		            fieldLabel: 'Salary',
		            width:300,
		            name: 'salary',
		            value: '',
					decimalPrecision:2
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
	    title: 'New Employees',
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
		full_name: full_name.getValue(), 
		hire_date: hire_date.getValue(),
		title: title.getValue(),
		salary: salary.getValue(),
		insert:true
	});
	
	dsData.add(record);
	dialog.hide();			
}

function showDetail(row)
{
	if(formPanel == null)
		createDialog();
	
	dialog.show();
}