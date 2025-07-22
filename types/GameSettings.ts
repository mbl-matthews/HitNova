export interface GameSettings {
    snippet: RandomSnippetSettings,
    random: RandomStartSettings,
}

export interface RandomSnippetSettings {
    length: number,
    minStart: boolean,
    maxStart: boolean,
}

export interface RandomStartSettings {
    minStartActive: boolean,
    minStartNumber: number,
    maxStartActive: boolean,
    maxStartNumber: number,
}
