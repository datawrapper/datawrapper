define(function(require) {
    var ChartFolderTree = function(raw_folders) {
        this.tree = genTree(raw_folders);
        // this.list = genList(this.tree);
    }

    function genTree(raw) {
        raw.map(function(group) {
            if (group.type === "user")
                group.organization = false;
            delete(group.type);
            group.folders.forEach(function(folder) {
                delete(folder.type);
                delete(folder.user);
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

        tree = raw.sort(function(a, b) {
            if (!a.organization) return -1;
            if (!b.organization) return 1;
            return a.organization.name.localeCompare(b.organization.name);
        });

        return tree;
    }

    ChartFolderTree.prototype = {
        getLegacyTree: function() {
            return this.tree;
        },
        debugTree: function() {
            console.log(this.tree);
        }
    };

    return ChartFolderTree;
});
