export default {
	gifsicle: {
		interlaced: true,
	},
	mozjpeg: {
		quality: 85,
	},
	optipng: {
		optimizationLevel: 3,
	},
	svgo: {
		plugins: [
			{ name: 'removeViewBox', active: false },
			{
				name: 'preset-default',
				params: {
					overrides: {
						removeViewBox: false,
					},
				},
			},
		],
	},
	webp: {
		quality: 75,
	},
}
