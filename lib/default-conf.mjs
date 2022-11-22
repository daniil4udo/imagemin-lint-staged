export default {
	$silentErrors: true,

	gifsicle: {
		interlaced: true,
	},
	mozjpeg: {
		quality: 85,
	},
	optipng: {
		optimizationLevel: 4,
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
