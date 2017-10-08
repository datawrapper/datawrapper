define(function(require) {
    var ChartFolderTree = function(raw_folders, current) {
        this.tree = genTree(raw_folders);
        this.list = genList();
        this.current = current;
        this.rendercallbacks = {};
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
        debugTree: function() {
            console.log(this.tree, this.list);
        },
        getFolderById: function(f_id) {
            return (typeof this.list[f_id] !== "undefined") ? this.list[f_id].folder : false;
        },
        getPathToFolder: function(f_id) {
            return (typeof this.list[f_id] !== "undefined") ? this.list[f_id].path_info.strings : false;
        },
        getIdsToFolder: function(f_id) {
            return (typeof this.list[f_id] !== "undefined") ? this.list[f_id].path_info.ids : false;
        },
        getSubFolders: function(f_id) {
            var subfolders = (typeof this.list[f_id] !== "undefined") ? this.list[f_id].folder.sub : false;
            return (subfolders) ? subfolders : [];
        },
        getRootSubFolders: function(org_id) {
            var subfolders = this.tree.filter(function(group) {
                return (group.organization) ? (group.organization.id === org_id) : (group.organization === org_id);
            })[0].folders;
            return (subfolders) ? subfolders : [];
        },
        getOrgNameById: function(org_id) {
            var org = this.tree.filter(function(group) {
                return (group.organization) ? (group.organization.id === org_id) : (group.organization === org_id);
            })[0].organization;
            return (org) ? org.name : false;
        },
        setCurrentSort: function(sort) {
            this.current.sort = sort;
        },
        getCurrentSort: function() {
            return this.current.sort;
        },
        setCurrentFolder: function(folder_id, org_id) {
            this.current.folder = folder_id;
            this.current.organization = org_id;
            this.rendercallbacks.changeActiveFolder(folder_id, org_id);
        },
        getCurrentFolder: function() {
            return {
                folder: this.current.folder,
                organization: this.current.organization
            };
        },
        setRenderCallbacks: function(callbacks) {
            this.rendercallbacks = callbacks;
        },
        reRenderTree: function() {
            var cbs = this.rendercallbacks,
                cur = this.current;
            this.tree.forEach(function(group) {
                cbs.changeChartCount(false, group.organization.id, group.charts);
                cbs.renderSubtree(group.organization.id, group.folders);
            });
            cbs.changeActiveFolder(cur.folder, cur.organization);
        }
    };

    return ChartFolderTree;
});
