/**
 * A function that converts an ordinary number, such as `4`, `11`, `25`, into an **ordinal number** (i.e. `4th`, `11th`, `25th`), a number used to determine a *position* in a list.
 * The function first checks if the remainder of the number when divided by 10 is 1, 2, or 3 and when the tens value is equal to 1.
 * If this is the case:
 *  The function appends `th` to the number (`TH` if `capitalise` is `true`)
 * Otherwise:
 *  Either `st`, `nd` or `th` is added depending on the ones value. (`ST`, `ND`, `TH` if `capitalise` is `true`)
 * @param {number} num The number to be converted
 * @param {boolean} [capitalise] Whether to capitalise or not
 * @returns {string} The ordinal number, as a string 
 */
 function ordinalNumber(num: number, capitalise?: boolean): string {
    if ([1, 2, 3].includes(num % 10) && Math.floor((num % 100) / 10) === 1) return `${num}${capitalise ? 'TH' : 'th'}`
    else return `${num}${(capitalise ? ['ST', 'ND', 'RD'] : ['st', 'nd', 'rd'])[num % 10 - 1]}`
}

/**
 * Pluralise a noun.
 * 
 * (irregulars are dealt with in a third parameter)
 * 
 * some nouns will already be pluralised and won't need an irregular param, however some irregulars will do, check below
 * 
 * **CERTAIN NOUNS WILL FOLLOW EXCEPTIONS**
 * 
 * (for those that are exceptions that shouldn't be followed, use the `irregular?: string` param)
 * 
 * 
 * __`-S`, `-SS`, `-CH`, `-SH`, -`X` AND -`Z` RULE__ _(**add `-es`**)_
 * 
 * 'fez' --> 'fezzes'
 * 
 * 'quiz' -> 'quizzes'
 * 
 * 'rest' -> add `-es`
 * 
 * 
 * __`-F` AND `-FE` RULE__ _(**remove the `-f` or `-fe` and add `-v` before adding `-es`**)_
 * 
 * 'roof' ---> 'roofs'
 * 
 * 'belief' -> 'beliefs'
 * 
 * 'chef' ---> 'chefs'
 * 
 * 'chief' --> 'chiefs'
 * 
 * 'cliff' --> 'cliffs'
 * 
 * 'spliff' -> 'spliffs'
 * 
 * 
 * __`-O` RULE__ _(**add `-es`**)_
 * 
 * 'photo' -> 'photos'
 * 
 * 'piano' -> 'pianos'
 * 
 * 'halo' --> 'halos'
 * 
 * *Want to suggest a change to add more exceptions?* Head to the {@link https://github.com/Zahid556/ZBot-En| ZBot-En GitHub Repository} and suggest your changes there.
 * @param {number} num The __number__ of the item
 * @param {string} singular The __singular__ form of the noun
 * @param {string} [irregular] The irregular form of the __plural__ noun, if any
 * @returns {string} The plural noun 
 */
function pluralise(num: number, singular: string, irregular?: string): string {
    if (!irregular) {
        let lastTwoLetters = singular.split('').splice(singular.split('').length - 2, 2)
        if (
            [
                's',
                'ss',
                'sh',
                'ch',
                'x',
                'z'
            ].some(
                item => {
                    return (
                        item.split('').length === 2 && item.split('')[0] === lastTwoLetters[0] && item.split('')[1] === lastTwoLetters[1]
                    ) || (
                        item.split('').length === 1 && item.split('')[0] === (lastTwoLetters.length === 1 ? lastTwoLetters[0] : lastTwoLetters[1])
                    )
                }
            )
        ) {
            if (singular === 'fez') return 'fezzes'
            else if (singular === 'quiz') return 'quizzes'
            else return `${num} ${num === 1 ? singular : `${singular}es`}`
        } else if (
            [
                'f',
                'fe'
            ].some(
                item => {
                    return (
                        item.split('').length === 2 && item.split('')[0] === lastTwoLetters[0] && item.split('')[1] === lastTwoLetters[1]
                    ) || (
                        item.split('').length === 1 && item.split('')[0] === (lastTwoLetters.length === 1 ? lastTwoLetters[0] : lastTwoLetters[1])
                    )
                }
            )
        ) {
            if (['roof', 'belief', 'chef', 'chief', 'cliff', 'spliff'].some(w => w === singular)) return `${num} ${num === 1 ? singular : `${singular}s`}`
            else return `${num} ${num === 1 ? singular : singular.replace(/(f*)(fe?)/gm, () => 'ves')}`
        } else if (
            lastTwoLetters[1] === 'y'
            && !['a', 'e', 'i', 'o', 'u'].some(r => lastTwoLetters[0] === r)
        ) {
            return `${num} ${num === 1 ? singular : `${singular.replace(/([^aeiou])(y)$/gm, (w) => w + 'ies')}`}`
        } else if (
            lastTwoLetters[1] === 'y'
            && ['a', 'e', 'i', 'o', 'u'].some(r => lastTwoLetters[0] === r)
        ) {
            return `${num} ${num === 1 ? singular : `${singular}s`}`
        } else if (
            lastTwoLetters[1] === 'o'
        ) {
            if (['photo', 'piano', 'halo'].some(w => w === singular)) return `${num} ${num === 1 ? singular : `${singular}s`}`
            else return `${num} ${num === 1 ? singular : `${singular}es`}`
        } else if (
            lastTwoLetters[0] === 'u'
            && lastTwoLetters[1] === 's'
        ) {
            return `${num} ${num === 1 ? singular : singular.replace(/us$/gm, 'i')}`
        } else if (
            lastTwoLetters[0] === 'i'
            && lastTwoLetters[1] === 's'
        ) {
            return `${num} ${num === 1 ? singular : singular.replace(/is$/gm, 'es')}`
        }  else if (
            lastTwoLetters[0] === 'o'
            && lastTwoLetters[1] === 'n'
        ) {
            return `${num} ${num === 1 ? singular : singular.replace(/on$/gm, 'a')}`
        }
        return `${num} ${num === 1 ? singular : `${singular}s`}`
    }
    return `${num} ${num === 1 ? singular : irregular}`
}

/**
 * Takes a list of items and converts them into an asyndetic (comma-separated) list.
 * 
 * **Examples**
 * 
 * `['apple']` ------------------------------> **`apple`**
 * 
 * `['apple', 'banana']` --------------------> **`apple and banana`**
 * 
 * `['apple', 'banana', 'carrot']` ----------> **`apple, banana and carrot`**
 * @param {string[]} list The list of items
 * @returns {string} The asyndetic list
 */
function commaList(list: string[]): string {
    switch (list.length) {
        case 0:
            return ''
        case 1:
            return list[0]
        case 2:
            return `${list[0]} and ${list[1]}`
        default:
            return list
                .map((l, i, arr) => {
                    switch (i) {
                        case arr.length - 1:
                            return `and ${l}`
                        case arr.length - 2:
                            return l
                        default:
                            return `${l},`
                    }
                })
                .join(' ')
    }
}

export {
    ordinalNumber,
    pluralise,
    commaList
}
