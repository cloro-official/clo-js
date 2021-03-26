module.exports = {
  apps : [{
    script: 'main.js',
	instances: '1'
	// autobackoff
	exp_backoff_restart_delay: 100,
	
	// auto-restart config
	watch: true,
    ignore_watch: ['database', 'node_modules', 'json/static_client.json']
  }]
};
