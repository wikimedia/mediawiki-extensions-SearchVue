<template>
	<div class="content-skeleton">
		<div class="content-skeleton__block">
			<div
				v-for="n in lines"
				:key="`skeleton-${UUID}-${n}`"
				class="content-skeleton__row">
			</div>
		</div>
	</div>
</template>

<script>
// @vue/component
module.exports = exports = {
	name: 'ContentSkeleton',
	compatConfig: { MODE: 3 },
	compilerOptions: { whitespace: 'condense' },
	props: {
		lines: {
			type: Number,
			default: 2
		}
	},
	data() {
		return {
			UUID: Math.floor( Math.random() * 9000 ) // generate a 3-4 digit number
		};
	}
};

</script>

<style lang="less">
.content-skeleton {
	margin: 0 20px;
	flex-shrink: 0;
	min-width: 174px;

	&__block {
		margin-bottom: 32px;
	}

	&__row {
		height: 16px;
		margin-bottom: 6px;
		background-color: #eaecf0;
	}
}
</style>
