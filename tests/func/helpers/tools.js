/**
 * This file is part of the "Linkstore" project.
 *
 * (c) 2017 - Ringabell
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */
'use strict';


// values followed by a ((type)) will be coerced to this type
// ex: Then table subscription should have field offerId with value 2201((number)) where id is 2200
// ex: And  table transaction_wha should match the following table where subscriptionId is 2200
//         | status         | INACTIVE |
//         | subscriptionId | 2200((number)) |
//         | offersId       | 2200, 2001((array)) |
exports.coerceToType = value => {
    const matchResult = value.match(/^(.*)\(\((\w+)\)\)$/);
    let response = value;

    if (matchResult) {
        switch (matchResult[2]) {
            case 'number':
                response = Number(matchResult[1]);
                break;
            case 'boolean':
                response = matchResult[1] === 'true';
                break;
            case 'null':
                response = null;
                break;
            case 'array':
                response = matchResult[1] ? matchResult[1].replace(/\s/g, '').split(',') : null;
                break;
            case 'string':
            default:
                break;
            case 'date':
                if (matchResult[1] === 'today') {
                    response = new Date();
                } else {
                    response = new Date(matchResult[1]);
                }
                break;
        }
    }
    return response;
};
