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

export {
    ordinalNumber
}
