module.exports = {
  apps : [{
    name   : "app1",
    script : "./dist/src/app.js",
    env_production : {
	NODE_ENV: "production"
	}
  }]
}
