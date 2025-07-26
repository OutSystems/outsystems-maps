// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Helper {
	export function JsonFormatter(text: string): JSON {
		let json = {};
		if (text === undefined || text === '') return json as JSON;

		/* NO SONAR */
		// text.substring(1, text.length - 1)
		//     .replace(/ /g, '')
		//     .split(',')
		//     .map((option) => {
		//         if (option === '') return;
		//         const wordSplitted = option.split(':');
		//         const part1 = wordSplitted[0];
		//         const part2 = wordSplitted[1];
		//         json[part1.replace(/"/g, '')] = JSON.parse(
		//             part2.replace(/'/g, '"')
		//         );
		//     });

		// eslint-disable-next-line no-eval
		json = eval(`(${text})`);

		return json as JSON;
	}
}
