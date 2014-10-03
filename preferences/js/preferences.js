/**
 * @author Greivin
 */
var dsDefault = null;
var topAnchor = '95%';
var gramsPerBag = null;
var size = null;
var days = null;
var defaultMargin = null;
var sell1g = null;
var sell3g = null;
var sell7g = null;

Ext.onReady(function() 
{
	Ext.QuickTips.init();

	// shorthand alias
    var fm = Ext.form;
	var win = null;
	var paging = null;
	
	var gridForm = new Ext.form.BasicForm(
		Ext.get("general-form"),
		{
			
		}
	);

	//create the Data Store
    dsSize = new Ext.data.Store(
    {
        url: "/sizes/php/sizes_data.php",
        method: 'post',
        reader: new Ext.data.JsonReader(
        {
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
            {
                name: 'id',
                type: 'int'
            }, 
            {
                name: 'name',
                type: 'string'
            }]
        })
    });
	
	dsSize.on('load', function()
	{
		if(dsDefault.getCount() > 0)
			size.setValue(dsDefault.getAt(0).data.default_size);	
	});
	
	dsSize.load();
		
    //default values
    dsDefault = new Ext.data.Store(
    {
        proxy: new Ext.data.HttpProxy(
        {
            url: 'php/preferences_data.php',
            method: 'post'
        }),
        reader: new Ext.data.JsonReader(
        {
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
            {
                name: 'id',
                type: 'int'
            },
			{
                name: 'default_size',
                type: 'int'
            }, 
            {
                name: 'default_days',
                type: 'int'
            }, 
            {
                name: 'default_grams_50lbs',
                type: 'float'
            }, 
			{
                name: 'sell_7g',
                type: 'float'
            },
			{
                name: 'sell_3g',
                type: 'float'
            },
			{
                name: 'sell_1g',
                type: 'float'
            },
			{
                name: 'default_margin',
                type: 'int'
            },
            {
                name: 'original_default_grams_50lbs',
                type: 'float'
            }]
        })
    });
    
    var formPanel = new Ext.form.FormPanel(
    {
        bodyStyle: 'padding:0px',
        method: 'post',
		region:'center',
        url: "php/process_preferences.php",
        items: [
        {
            layout: 'column',
            border: false,
            labelAlign: 'right',
            bodyStyle: 'padding:5px',
            items: [
            {
                columnWidth: 1,
                layout: 'form',
                border: false,
                items: [
				gramsPerBag = new Ext.form.NumberField(
                {
                    fieldLabel: 'Default grams per 50lbs bag',
                    name: 'default_grams_50lbs',
                    width:100,
                    value: '0'
                }),
				size = new Ext.form.ComboBox(
                {
                    fieldLabel: 'Size',
                    store: dsSize,
                    name: 'default_size',
                    displayField: 'name',
                    valueField: 'id',
                    editable: true,
                    forceSelection: true,
                    allowBlank: false,
                    width:100, 
                    mode: 'local',
                    triggerAction: 'all',
                    selectOnFocus: true
                }), 
				days = new Ext.form.NumberField(
                {
                    fieldLabel: 'Days',
                    name: 'default_days',
                    width:100,
                    value: '0'
                }),
				defaultMargin = new Ext.form.NumberField(
                {
                    fieldLabel: 'Default Margin',
                    name: 'default_margin',
                    width:100,
                    value: '0'
                })]
            }],
			buttonAlign:'left',
			buttons:[
			{
				text:'Save',
				handler:savePreferences
			}]
        }]
    });
		
	var viewport = new Ext.Viewport(
	{
		layout: "border",
		items:[
		new Ext.BoxComponent(
		{ // raw
            region:'north',
            el: 'north',
			height:45    
        }),
		formPanel
		]
	});
	
	dsDefault.on('load', setData);
	
	dsDefault.load();

	function setData()
	{
		if(dsDefault.getCount() > 0)
			size.setValue(dsDefault.getAt(0).data.default_size);
			
        days.setValue(dsDefault.getAt(0).data.default_days);		
		gramsPerBag.setValue(dsDefault.getAt(0).data.default_grams_50lbs);
		
		defaultMargin.setValue(dsDefault.getAt(0).data.default_margin);		
	}
	
    function loadDataSource()	
    {	
		dsDefault.load();
	}
	
	function savePreferences()
    {
        formPanel.getForm().submit({
	                    url: 'php/process_preferences.php',
	                    waitMsg: 'Saving changes...',
	                    success: function(fp, o)
						{
	                        
	                    },
						failure: function(fp, o)
						{
							alert('Your changes were not saved.');
						}
	                });
        dsDefault.getAt(0).data.default_grams_50lbs = gramsPerBag.getValue();        
    }
});