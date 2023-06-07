import path from 'path';
import Webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import SveltePreprocess from 'svelte-preprocess';
import Autoprefixer from 'autoprefixer';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import CSSMinimizerPlugin from 'css-minimizer-webpack-plugin';
//import SvelteCheckPlugin from 'svelte-check-plugin';

import { CleanWebpackPlugin } from 'clean-webpack-plugin';

//interface Configuration extends WebpackConfiguration {
interface MergedConfiguration extends Webpack.Configuration {
  devServer?: WebpackDevServer.Configuration;
}

const mode = process.env.NODE_ENV ?? 'development';
const isProd = mode === 'production';
const isDev = !isProd;

/**
 * Babel will compile modern JavaScript down to a format compatible with older browsers, but it will also increase your
 * final bundle size and build speed. Edit the `browserslist` property in the package.json file to define which
 * browsers Babel should target.
 *
 * Browserslist documentation: https://github.com/browserslist/browserslist#browserslist-
 */
const useBabel = true;

/**
 * This option controls whether or not development builds should be compiled with Babel. Change this to `true` if you
 * intend to test with older browsers during development, but it could significantly impact your build speed.
 */
const useBabelInDevelopment = false;

/**
 * Define paths to any stylesheets you wish to include at the top of the CSS bundle. Any styles compiled from svelte
 * will be added to the bundle after these. In other words, these are global styles for your svelte app. You can also
 * specify paths to SCSS or SASS files, and they will be compiled automatically.
 */
const stylesheets = [
	'./src/styles/index.scss'
];

/**
 * Change this to `true` to generate source maps alongside your production bundle. This is useful for debugging, but
 * will increase total bundle size and expose your source code.
 */
const sourceMapsInProduction = false;

/**
 * Change this to `true` to run svelte-check during hot reloads. This will impact build speeds but will show more
 * thorough errors and warnings.
 */
//const svelteCheckInDevelopment = false;

/**
 * Change this to `false` to disable svelte-check during production builds. Build speeds will be faster, but error
 * and warning checks will be less thorough.
 */
//const svelteCheckInProduction = true;

const config: MergedConfiguration = {  
  mode: isProd ? 'production' : 'development',
	entry: {
		bundle: [
			...stylesheets,
      './src/main.ts'
    ]
	},  
  resolve: {
		alias: {
			svelte: path.resolve('node_modules', 'svelte'),
			//src: path.resolve('src')
			'@src': path.resolve(__dirname, 'src/'),
			'@styles': path.resolve(__dirname, 'src/styles/'),			
		},    
		extensions: ['.mjs', '.ts', '.js', '.svelte', '.scss', '.css'],
		mainFields: ['svelte', 'browser', 'module', 'main'],
		//modules: [path.resolve(__dirname, 'src'), 'node_modules']
		//conditionNames: ['svelte', 'browser']
  },
  output: {
    path: path.resolve(__dirname, 'public/build'),
    publicPath: '/build/',
		filename: '[name].js',    
		chunkFilename: '[name].[id].js'    
  },	
  module: {
    rules: [
      { 
        test: /\.ts$/,
        use: [
					{ 
						loader: 'ts-loader',
					}
				],
        exclude: /node_modules/ 
      }, 			
      {
				test: /\.svelte$/,
				use: {
					loader: 'svelte-loader',
					options: {
						compilerOptions: {
							dev: isDev
						},
						emitCss: isProd,
						hotReload: isDev,
						hotOptions: {
							noPreserveState: false,
							optimistic: true,
						},
            preprocess: SveltePreprocess({ 
              sourceMap: isDev,
							scss: true,
							sass: true,
							postcss: {
								plugins: [
									Autoprefixer
								]
							}
            })
					}
				}
			},
			// Required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
			// See: https://github.com/sveltejs/svelte-loader#usage
			{
				test: /node_modules\/svelte\/.*\.mjs$/,
				resolve: {
					fullySpecified: false
				}
			},
			{
				test: /\.(scss|sass)$/,
				use: [
					{
						loader: MiniCssExtractPlugin.loader
					},
					'css-loader',
					{
						loader: 'postcss-loader',
						options: {
							postcssOptions: {
								plugins: [
									Autoprefixer
								]
							}
						}
					},
					'sass-loader'
				]
			},
			{
				test: /\.css$/,
				use: [
          MiniCssExtractPlugin.loader,
					'css-loader'
				]
			},
			{
				test:  /\.(svg|ico|jpg|jpeg|png|gif|eot|otf|webp|ttf|woff|woff2|cur|ani|pdf)(\?.*)?$/,
				loader: 'file-loader',
			},			  
    ],
  },  
  plugins: [
    new Webpack.ProvidePlugin({
      $: 'jquery',
    }),
		new MiniCssExtractPlugin({
			filename: '[name].css'
		}),
    //...(svelteCheckInDevelopment || isProduction && svelteCheckInProduction ? [new SvelteCheckPlugin()] : [])    
    //new SvelteCheckPlugin()
  ],
  devtool: isProd ? false : 'source-map',
  //devtool: argv.mode === 'production' ? undefined : 'eval-source-map',
	devServer: {
		hot: true,
		static: {
			directory: path.join(__dirname, 'public'),
		}
	},
	stats: {
		chunks: false,
		chunkModules: false,
		modules: false,
		assets: true,
		entrypoints: false
	},	
	target: isDev ? 'web' : 'browserslist',
}

// Additional configuration for production bundles
if (isProd) {
	// Clean the build directory for production builds
	config.plugins?.push(new CleanWebpackPlugin());

	// Minify CSS files
	config.optimization?.minimizer?.push(
		new CSSMinimizerPlugin({
			parallel: true,
			minimizerOptions: {
				preset: [
					'default',
					{
						discardComments: { removeAll: !sourceMapsInProduction },
					},
				],
			},
		})
	);

	// Minify and treeshake JS
	if (config.optimization === undefined) {
		config.optimization = {};
	}

	config.optimization.minimize = true;
}

// Parse as JSON5 to add support for comments in tsconfig.json parsing.
//require('require-json5').replace();

// Babel
if (useBabel && (isProd || useBabelInDevelopment)) {
	const loader = {
		loader: 'babel-loader',
		options: {
			sourceType: 'unambiguous',
			presets: [
				[
					// Docs: https://babeljs.io/docs/en/babel-preset-env
					'@babel/preset-env',
					{
						debug: false,
						corejs: { version: 3 },
						useBuiltIns: 'usage'
					}
				]
			],
			plugins: ['@babel/plugin-transform-runtime']
		}
	};

	config.module?.rules.unshift({
		test: /\.(?:m?js|ts)$/,
		include: [
			path.resolve(__dirname, 'src'),
			path.resolve('node_modules', 'svelte')
		],
		exclude: [
			/node_modules[/\\](css-loader|core-js|webpack|regenerator-runtime)/
		],
		use: loader,
	});

	const svelte = config.module?.rules.find(rule => {
		if (typeof rule !== 'object') return false;
		else if (Array.isArray(rule.use))
			return rule.use.includes((e: any) => typeof e.loader === 'string' && e.loader.startsWith('svelte-loader'));
		else if (typeof rule.use === 'object')
			return rule.use.loader?.startsWith('svelte-loader') ?? false;
		return false;
	}) as Webpack.RuleSetRule;

	if (!svelte) {
		console.error('ERR: Could not find svelte-loader for babel injection!');
		process.exit(1);
	}

	if (!Array.isArray(svelte.use)) {
		svelte.use = [svelte.use as any];
	}

	svelte.use.unshift(loader);
}

export default config;
