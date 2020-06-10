'use strict';

/**
 * Based on sassdoc-extras `groupName`,
 * but allows for nested subgroups.
 * See http://sassdoc.com/extra-tools/#groups-aliases-groupname
 * and https://github.com/SassDoc/sassdoc-extras/blob/master/src/groupName.js
 */

const lowerCaseSlug = (obj, slug) => {
  if (slug !== slug.toLowerCase()) {
    obj[slug.toLowerCase()] = obj[slug];
    delete obj[slug];
  }
};

module.exports = (ctx) => {
  const subgroupsByGroup = (ctx.subgroupsByGroup = {});
  const orderedGroups = (ctx.orderedGroups = []);

  // Store list of subgroups with parent group name
  for (let slug of Object.keys(ctx.groups)) {
    if (typeof ctx.groups[slug] === 'string') {
      lowerCaseSlug(ctx.groups, slug);
      slug = slug.toLowerCase();
      orderedGroups.push(slug);
    } else {
      const orderedSubgroups = [];
      for (let subgroup of Object.keys(ctx.groups[slug])) {
        lowerCaseSlug(ctx.groups[slug], subgroup);
        subgroup = subgroup.toLowerCase();

        if (Object.prototype.hasOwnProperty.call(subgroupsByGroup, subgroup)) {
          ctx.logger.warn(`Group slugs must be unique: "${subgroup}"`);
        } else {
          orderedSubgroups.push(subgroup);
          subgroupsByGroup[subgroup] = slug;
        }
      }
      if (orderedSubgroups.length) {
        orderedGroups.push({ parent: slug, subgroups: orderedSubgroups });
      }
    }
  }

  for (const item of ctx.data) {
    const group = {};

    for (let slug of item.group) {
      slug = slug.toLowerCase();

      if (Object.prototype.hasOwnProperty.call(ctx.groups, slug)) {
        group[slug] = ctx.groups[slug];
      } else if (Object.prototype.hasOwnProperty.call(subgroupsByGroup, slug)) {
        const parentGroup = subgroupsByGroup[slug];
        group[slug] = ctx.groups[parentGroup][slug];
      } else {
        group[slug] = ctx.groups[slug] = slug;
        orderedGroups.push(slug);
      }
    }

    item.groupName = group;
  }
};
