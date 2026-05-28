// eslint-disable-next-line @typescript-eslint/no-unused-vars
namespace Provider.Layers.deckgl.Helper {
    export function HexToRgba(hex: string): DeckglColor {
        return [
            parseInt(hex.slice(1, 3), 16),
            parseInt(hex.slice(3, 5), 16),
            parseInt(hex.slice(5, 7), 16),
            hex.length > 7 ? parseInt(hex.slice(7, 9), 16) : 255,
        ];
    }
}
