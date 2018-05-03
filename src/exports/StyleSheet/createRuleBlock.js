/**
 * Copyright (c) 2016-present, Nicolas Gallagher.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @noflow
 */

import hyphenateStyleName from 'hyphenate-style-name';
import mapKeyValue from '../../modules/mapKeyValue';
import normalizeValue from './normalizeValue';
import prefixStyles from '../../modules/prefixStyles';

const createDeclarationString = (prop, val) => {
  const name = hyphenateStyleName(prop);
  const value = normalizeValue(prop, val);
  const flag = !name.startsWith('-') && !name.startsWith('pointer-') ? ' !important' : '';
  if (Array.isArray(val)) {
    return val.map(v => `${name}:${v}${flag}`).join(';');
  }
  return `${name}:${value}${flag}`;
};

/**
 * Generates valid CSS rule body from a JS object
 *
 * createRuleBlock({ width: 20, color: 'blue' });
 * // => 'color:blue;width:20px'
 */
const createRuleBlock = style =>
  mapKeyValue(prefixStyles(style), createDeclarationString)
    .sort()
    .join(';');

export default createRuleBlock;
