var plantsGrid;
var plantsDs;
var topAnchor = '95%';
var size = null;
var days = null;
var currentRow = null;
var formPanel = null;
var dialog = null;
var dsSize = null;
var dsDefault = null;

Ext.onReady(function()
{
    Ext.QuickTips.init();
    
    //default values
    dsDefault = new Ext.data.Store(
    {
        proxy: new Ext.data.HttpProxy(
        {
            url: 'php/default_data.php',
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
            }]
        })
    });
    
    dsDefault.load();
    
    var xg = Ext.grid;
    
    var reader = new Ext.data.JsonReader(
    {
        root: 'data',
        id: 'plants',
        totalProperty: 'totalCount'
    }, [
    {
        name: 'id',
        type: 'int'
    }, 
    {
        name: 'plant_name'
    }, 
    {
        name: 'block',
        type: 'int'
    }, 
    {
        name: 'block_name',
		type: 'int'
    }, 
    {
        name: 'size',
        type: 'int'
    }, 
    {
        name: 'size_name'
    }, 
    {
        name: 'qty',
        type: 'int'
    }, 
    {
        name: 'date_planted',
        type: 'date',
        dateFormat: 'Y-m-d'
    }]);
    
    /*Ext.grid.GroupSummary.Calculations['totalCost'] = function(v, record, field)
    {
        return v;
    }
    
    var summary = new Ext.ux.grid.GridSummary();*/
    
    var selModel = new Ext.grid.RowSelectionModel(
    {
        singleSelect: true
    });
    
    grid = new xg.EditorGridPanel(
    {
        ds: new Ext.data.GroupingStore(
        {
            reader: reader,
            proxy: new Ext.data.HttpProxy(
            {
                url: "/plants/php/plants_data.php",
                method: 'post'
            }),
            sortInfo: 
            {
                field: 'block_name',
                direction: 'ASC'
            },
            autoLoad: true
        }),
        columns: [new Ext.grid.RowNumberer(),
		{
            header: 'Block',
            dataIndex: 'block_name',
			width:55,
            sortable: true,
			align:'center'
        }, 
        {
            header: 'Plant Id',
            dataIndex: 'id',
			width:60,
            sortable: true,
			align:'center'
        },
		{
            header: 'Size',
            dataIndex: 'size_name',
			width:55,
			align:'center',
            sortable: true
        }, 
        {
            id: 'plant_name',
            header: 'Plant Name ',
            dataIndex: 'plant_name',
            sortable: true
        },          
         
        {
            header: 'Qty',
            dataIndex: 'qty',
            type: 'float',
            sortable: true,
			width:55,
			align:'right'
        }, 
        {
            header: 'Start Date',
            dataIndex: 'date_planted',
            renderer: Ext.util.Format.dateRenderer('m/d/y'),
            sortable: true,
			align:'center'
        }],
        autoSizeColumns: true,
        autoSizeHeaders: true,
        viewConfig: 
        {
            forceFit: false
        },
        editable: false,
        frame: true,
        stripeRows: true,
        clickToEdit: 1,
        animCollapse: true,
        trackOver: false,
        region: 'center',
        title: "Inventory",
        iconCls: 'icon-grid',
        selModel: selModel/*,
        tbar: [
        {
            text: 'Preferences',
            handler: showPreferences
        }]*/
    });
    
    grid.on('celldblclick', function()
    {
        var rows = grid.getSelectionModel().getSelections();
        var id = "";
        if (rows.length > 0) 
        {
            id = rows[0].get('id');
            document.location = "/plants/view_plant.php?id=" + id;
        }
    });
    
    var viewport = new Ext.Viewport(
    {
        layout: "border",
        items: [new Ext.BoxComponent(
        { // raw
            region: 'north',
            el: 'north',
            height: 45
        }), grid]
    });
    
    function createDialog()
    {
        // create the Data Store
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
        
        formPanel = new Ext.form.FormPanel(
        {
            bodyStyle: 'padding:0px',
            method: 'post',
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
                    items: [size = new Ext.form.ComboBox(
                    {
                        fieldLabel: 'Size',
                        store: dsSize,
                        name: 'default_size',
                        displayField: 'name',
                        valueField: 'id',
                        editable: true,
                        forceSelection: true,
                        allowBlank: false,
                        anchor: topAnchor,
                        mode: 'local',
                        triggerAction: 'all',
                        selectOnFocus: true
                    }), days = new Ext.form.NumberField(
                    {
                        fieldLabel: 'Days',
                        name: 'default_days',
                        anchor: topAnchor,
                        value: '180'
                    })]
                }]
            }]
        });
        
        dsSize.on('load', function()
        {
            size.setValue(dsDefault.getAt(0).data.default_size);
            days.setValue(dsDefault.getAt(0).data.default_days);
            
        });
        
        dsSize.load();
        
        formPanel.on("actioncomplete", function(t, a)
        {
            alert('Your changes were saved!');
            
            formPanel.getForm().reset();
        });
        
        dialog = new Ext.Window(
        {
            title: 'Preferences',
            width: 300,
            height: 150,
            layout: 'fit',
            plain: true,
            closeAction: 'hide',
            modal: true,
            bodyStyle: 'padding:5px;',
            buttonAlign: 'center',
            items: formPanel,
            buttons: [
            {
                text: 'Save',
                handler: savePreferences
            }, 
            {
                text: 'Close',
                handler: function()
                {
                    dialog.hide();
                }
            }]
        });
    }
    
    function savePreferences()
    {
        formPanel.getForm().submit();
        dsDefault.getAt(0).data.default_size = size.getValue();
        dialog.hide();
    }
    
    function showPreferences(row)
    {
        if (formPanel == null) 
            createDialog();
        
        size.setValue(dsDefault.getAt(0).data.default_size);
        dialog.show();
    }
});
