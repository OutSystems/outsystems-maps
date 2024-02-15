/// <reference path="./DrawBasicShapeConfig.ts" />

// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Maps.Google.Configuration.DrawingTools {
	export class DrawFilledShapeConfig extends DrawBasicShapeConfig {
		public fillColor: string;
		public fillOpacity: number;

		// No need for constructor, as it is not doing anything. Left the constructor, to facilitade future usage.
		// constructor(config: JSON) {
		//     super(config);
		// }

		public getProviderConfig(): unknown[] {
			const configs = super.getProviderConfig();
			// eslint-disable-next-line prefer-const
			let provider = {
				...configs,
				fillColor: this.fillColor,
				fillOpacity: this.fillOpacity,
			};

			//Deleting all the undefined properties
			Object.keys(provider).forEach((key) => {
				if (provider[key] === undefined) delete provider[key];
			});

			return provider;
		}
	}
}
