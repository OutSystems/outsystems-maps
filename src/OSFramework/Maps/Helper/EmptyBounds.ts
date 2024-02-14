// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace OSFramework.Maps.Helper {
	/** Check if all bounds (north, south, east or west) are empty. If one or more are not, then return False */
	export function HasAllEmptyBounds(location: OSStructures.OSMap.BoundsString): boolean {
		return (
			IsEmptyString(location.north) &&
			IsEmptyString(location.south) &&
			IsEmptyString(location.east) &&
			IsEmptyString(location.west)
		);
	}

	/** Check if any of the bounds (north, south, east or west) is empty. If one or more are empty, then return True */
	export function HasAnyEmptyBound(location: OSStructures.OSMap.BoundsString): boolean {
		return (
			IsEmptyString(location.north) ||
			IsEmptyString(location.south) ||
			IsEmptyString(location.east) ||
			IsEmptyString(location.west)
		);
	}
}
