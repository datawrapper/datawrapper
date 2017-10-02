define(function(require) {
    var ChartFolderTree = function(raw_folders) {
        this.tree = genTree(raw_folders);
        this.list = genList();
    }

    function genTree(raw) {
        raw.forEach(function(group) {
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

    function genList() {
        var list = [];

        function traverse(folder, path_obj) {
            if (folder.sub) {
                var new_path_obj = {
                    strings: path_obj.strings.concat(folder.name),
                    ids: path_obj.ids.concat(folder.id)
                }
                folder.sub.forEach(function(sub_folder) {
                    traverse(sub_folder, new_path_obj);
                });
            }
            list[folder.id] = {
                folder: folder,
                path_info: path_obj
            };
        }

        this.tree.forEach(function(group) {
            group.folders.forEach(function(folder) {
                traverse(folder, {
                    strings: [],
                    ids: []
                });
            });
        });

        return list;
    }

    ChartFolderTree.prototype = {
        getLegacyTree: function() {
            return this.tree;
        },
        debugTree: function() {
            console.log(this.tree, this.list);
        },
        getPathToFolder: function(f_id) {
            return this.list[f_id].strings;
        },
        getIdsToFolder: function(f_id) {
            return this.list[f_id].ids;
        },
        getSubFolders: function(f_id) {
            return this.list[f_id].sub;
        }
    };

    return ChartFolderTree;
});
