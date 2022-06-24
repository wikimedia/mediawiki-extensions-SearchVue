<template>
	<quick-view msg="Welcome to the Special:Search vue.js extension"></quick-view>
</template>

<script>
/**
 * @file App.vue
 *
 * Placeholder
 */
var QuickView = require( './QuickView.vue' );

// @vue/component
module.exports = exports = {
	name: 'SearchVue',

	components: {
		'quick-view': QuickView
	}
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
