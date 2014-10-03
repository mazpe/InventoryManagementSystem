/**
 * @author 
 */

Ext.onReady(function() 
{
	Ext.QuickTips.init();

	// shorthand alias
    var fm = Ext.form;
	var win = null;
		
	var gridForm = new Ext.form.BasicForm(
		Ext.get("general-form"),
		{			
		}
	);		

    // create the Data Store
    var dsData = new Ext.data.Store(
	{
        url: "/sprays/php/sprays_data.php",
    	method:'post',
        reader: new Ext.data.JsonReader(
		{
            root: 'data',
            totalProperty: 'totalCount',
            id: 'id',
            fields: [
			 	{name: 'id', type:'int'},
                {name: 'template', type:'string'},
				{name: 'plant', type:'string'},
				{name: 'size', type:'string'},
	    		{name: 'days', type:'string'}				
			]
        }),

        // turn on remote sorting
        remoteSort: true
    });
	
    dsData.setDefaultSort('template', 'asc');

	// the column model has information about grid columns
    // dataIndex maps the column to the specific data field in
    // the data store
    
    var cm = new Ext.grid.ColumnModel([
    	new Ext.grid.RowNumberer(),
		{
			header: 'Template',
			dataIndex: 'template'			
		},
		{
			header:	'Plant',
			dataIndex: 'plant'
		},		
		{
			header: 'Size',
			dataIndex: 'size'	
		},         
		{
			header		:	'Days', 
			dataIndex	:	'days',
			type		:	'int'			
		}
    ]);

    // by default columns are sortable
    cm.defaultSortable = true;

	var grid = new Ext.grid.EditorGridPanel(
	{        
        region:'center',     
        frame:true,
        title:'Reports',
        store: dsData,
        cm: cm,
        trackMouseOver:true,
        selModel: new Ext.grid.RowSelectionModel({singleSelect:false}),        
		stripeRows: true,
		autoSizeColumns:true,
		autoSizeHeaders:true,
        loadMask: true,
        viewConfig: 
		{
            forceFit:true
        },       
        tbar:[
        {
			text	:	'Delete', 
			handler	:	function()
			{
					Ext.MessageBox.confirm('Confirm', 'Do you want to continue?', function(value)
					{
						var rows = grid.getSelectionModel().getSelections();
						
						if(rows.length > 0)
						{
							if(value == 'yes')
							{									
								var jsonData = '';
								
								for(var i = 0; i < rows.length; i++)
									jsonData += '{"delete":true, "id":"' + rows[i].data.id + '"}' + (rows.length == i + 1 ? "" : "," );

								jsonData = "[" + jsonData + "]";
								 
								gridForm.submit(
								{
									waitMsg: 'Deleting rows, please wait...',
									url:"/templates/php/process_templates.php",										
									params:{data:jsonData},
									success:function(form, action) 
									{										
										loadDataSource();
									},
									failure: function(form, action) 
									{
										alert(action.result.message);					
									}
								});												
							}
						}
						else
							alert('Please select the rows before.');	
					});		
			}
		},
		{
			text	:	'Refresh', 
			handler	:loadDataSource
		}]
    });

	var viewport = new Ext.Viewport(
	{
		layout: "border",
		items:[
		new Ext.BoxComponent(
		{ 
            region:'north',
            el: 'north',
			height:45    
        }),
		grid
		]
	});
	
    // trigger the data store load
    dsData.load();
    
    function loadDataSource()	
    {	
    	dsData.load();
	}
});