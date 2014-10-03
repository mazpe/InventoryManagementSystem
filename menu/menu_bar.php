<?
	session_start();
?>

Ext.onReady(function()
{
    Ext.QuickTips.init();

    var tb = new Ext.Toolbar({region:'north', el:'toolbar'});
	
	tb.render('toolbar');
	
    tb.add(
		{
			icon: '../menu/images/icon_add_plant.png',
			cls: 'x-btn-text-icon',
	        text:'Add Plants',
			handler: onButtonClick
	    },
		{
			icon: '../menu/images/icon_plant_list.png',
			cls: 'x-btn-text-icon',
	        text:'Plants List',
			handler: onButtonClick
	    },'-',		
		{
			icon: '../menu/images/icon_manage_jobs.png',
			cls: 'x-btn-text-icon',
	        text:'Manage Jobs',
			menu: 
			{        
	        	items: [
	                    {
	                        text: 'Jobs Pending',
	                        handler: onButtonClick
	                    }, 
	                    {
	                        text: 'Jobs Open',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Jobs Closed',
	                        handler: onButtonClick
	                    }]
			}
	    },
		{
			icon: '../menu/images/icon_report.png',
			cls: 'x-btn-text-icon',
	        text:'Reports',
			menu: 
			{        
	        	items: [
	                    {
	                        text: 'Last Done',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Report Generator',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Piece Work',
	                        handler: onButtonClick
	                    }]
			}			
	    },'-',
	    /*{
            text: 'Sell',
            handler: onButtonClick
        },'-',*/	    
        {
            text: 'Sell',
            handler: onButtonClick
        },'-',
	    {
            text: 'Tickets',
            handler: onButtonClick
        },
	    {
			cls: 'x-btn-text-icon',
	        text:'Spray',
			handler: onButtonClick
	    },'-',
	    {
	    	icon: '../menu/images/icon_utilities.png',
			cls: 'x-btn-text-icon',
	        text:'Utilities',
			menu: 
			{        
	        	items: [
	                    {
	                        text: 'Fertilizers',
	                        handler: onButtonClick
	                    }, 
	                    {
	                        text: 'Herbicides',
	                        handler: onButtonClick
	                    },
	                    /*{
	                        text: 'Jobs',
	                        handler: onButtonClick
	                    },*/
	                    {
	                        text: 'Labor',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Pots',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Sizes',
	                        handler: onButtonClick
	                    }, 
	                    {
	                        text: 'Soils',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Sources',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Spacings',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Templates',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Blocks',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Vendors',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Vendors Type',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Employees',
	                        handler: onButtonClick
	                    },
	                    {
	                        text: 'Preferences',
	                        handler: onButtonClick
	                    }]
			}
	    },'-',
	    {
	    	icon: '../menu/images/icon_logout.png',
			cls: 'x-btn-text-icon',
	        text:'Logout',
			handler: onButtonClick
	    }
	);

	tb = new Ext.Toolbar('login-bar');
	
	tb.addText("Welcome <? echo $_SESSION['name'];?>!");
	
	function onButtonClick(menu)
	{
		var page = '';
		
		var name = menu.text;
		
		if(name == 'Add Plants')
			page = 	'/plants/add_plant.php';
		else
		if(name == 'Plants List')
			page = 	'/plants/plants.php';
		else
		if(name == 'Jobs Pending')
			page = 	'/reports/jobs-pending.php';
		else
		if(name == 'Jobs Open')
			page = 	'/reports/jobs-open.php';
		else
		if(name == 'Jobs Closed')
			page = 	'/reports/jobs-closed.php';
		else
		if(name == 'Piece Work')
			page = 	'/reports/piece-work.php';
		else
		if(name == 'Report Generator')
			page = 	'/reports/report-generator.php';
		else		
		if(name == 'Jobs Ticket')
			page = 	'/reports/jobs-ticket.php';
		else
		if(name == 'Reports')
			page = 	'/reports/reports.php';
		else
		if(name == 'Last Done')
			page = 	'/reports/last-done-report.php';
		else
		if(name == 'Fertilizers')
			page = 	'/fertilizers/fertilizers.php';
		else
		if(name == 'Herbicides')
			page = 	'/herbicides/herbicides.php';
		else
		if(name == 'Jobs')
			page = 	'/jobs/jobs.php';
		else
		if(name == 'Labor')
			page = 	'/labor/labor.php';
		else
		if(name == 'Pots')
			page = 	'/pots/pots.php';
		else
		if(name == 'Sizes')
			page = 	'/sizes/sizes.php';
		else
		if(name == 'Soils')
			page = 	'/soils/soils.php';
		else
		if(name == 'Sources')
			page = 	'/sources/sources.php';
		else
		if(name == 'Spacings')
			page = 	'/spacings/spacings.php';
		else
		if(name == 'Templates')
			page = 	'/templates/templates.php';
		else
		if(name == 'Vendors')
			page = 	'/vendors/vendors.php';
		else
		if(name == 'Vendors Type')
			page = 	'/vendors_type/vendors_type.php';
		else
		if(name == 'Blocks')
			page = 	'/blocks/blocks.php';
		else
		if(name == 'Employees')
			page = 	'/employees/employees.php';
		else
		if(name == 'Preferences')
			page = 	'/preferences/preferences.php';
		else
		if(name == 'Tickets')
			page = 	'/ticket/ticket.php';
		else
		/*if(name == 'Sell')
			page = 	'/sell/sell.php';
		else*/		
		if(name == 'Sell')
			page = 	'/sell2/sell2.php';
		else
		if(name == 'Logout')
			page = "/logout.php";

		location.href = page;
    }
});