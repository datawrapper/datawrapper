define(function(require) {
    return function(tree) {
        tree.map(function(group) {
            if (group.type === "user")
                group.organization = false;
            delete(group.type);
            group.folders.forEach(function(folder) {
                delete(folder.type);
                delete(folder.user);
                delete(folder.organization);
                folder.sub = group.folders.filter(function(potential_subfolder) {
                    return (potential_subfolder.parent == folder.id) ? true : false;
                });
                if (!folder.sub.length)
                    folder.sub = false;
            });
            group.folders = group.folders.filter(function(folder) {
                return (folder.parent == null) ? true : false;
            });
        });

        tree = tree.sort(function(a, b) {
            if (!a.organization) return -1;
            if (!b.organization) return 1;
            return a.organization.name.localeCompare(b.organization.name);
        });

        return tree;
    }
});
