/**
 * @author Greivin Britton
 */

var topAnchor = '95%';
var name = null;
var desc = null;
var formPanel = null;

var currentRow = null;

formPanel = new Ext.form.FormPanel(
{				
    bodyStyle:'padding:0px',		
	method:'post',
	url: "/blocks/php/blocks_data.php",		
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
				allowBlank:false,
	            value: ''
	        }),
	        desc = new Ext.form.TextField(
	        {
	            fieldLabel: 'Description',
	            width:300,
	            name: 'desc',
				allowBlank:true,
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

var dialog = new Ext.Window({
    title: 'New block',
    width: 500,
    height:150,
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
		handler:function()
		{
			setValues();
		}
    },
	{
        text: 'Close',
		handler  : function()
		{
        	dialog.hide();
        }
    }]
});

function setValues()
{
	var record = new Ext.data.Record(
	{
		id:0, 
		name: name.getValue(), 
		desc: desc.getValue(),
		insert:true
	});
	
	dsData.add(record);			
	dialog.hide();			
}

function showDetail(row)
{		
	dialog.show();
}