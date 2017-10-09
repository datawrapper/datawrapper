define(function(require) {
    var ChartFolderTree = function(raw_folders, current) {
        this.tree = genTree(raw_folders);
        this.list = genList();
        this.current = current;
        this.rendercallbacks = {};
        this.current_folder_funcs = {};
        this.dropcallback = function(){};
    }

    function genTree(raw) {
        raw.forEach(function(group) {
            if (group.type === "user")
                group.organization = false;
            delete(group.type);
            group.folders.sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });
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

    function getRoot(org_id) {
        return this.tree.filter(function(group) {
            return (group.organization) ? (group.organization.id === org_id) : (group.organization === false);
        })[0];
    }

    ChartFolderTree.prototype = {
        debugTree: function() {
            console.log(this.tree, this.list);
        },
        getFolderById: function(f_id) {
            return (typeof this.list[f_id] !== "undefined") ? this.list[f_id].folder : false;
        },
        getFolderNameById: function(f_id) {
            return (typeof this.list[f_id] !== "undefined") ? this.list[f_id].folder.name : false;
        },
        setFolderName: function(f_id, name) {
            if (typeof this.list[f_id] !== "undefined")
                this.list[f_id].folder.name = name;
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
                return (group.organization) ? (group.organization.id === org_id) : (group.organization === false);
            })[0].folders;
            return (subfolders) ? subfolders : [];
        },
        getOrgNameById: function(org_id) {
            var org = this.tree.filter(function(group) {
                return (group.organization) ? (group.organization.id === org_id) : (group.organization === false);
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
        setCurrentFolderFuncs: function(callback) {
            this.current_folder_funcs = callback;
        },
        updateCurrentFolderFuncs: function() {
            this.current_folder_funcs(!this.current.folder);
        },
        setRenderCallbacks: function(callbacks) {
            this.rendercallbacks = callbacks;
        },
        setDropCallback: function(callback) {
            this.dropcallback = callback;
        },
        reRenderTree: function() {
            var cbs = this.rendercallbacks,
                cur = this.current;
            this.tree.forEach(function(group) {
                cbs.changeChartCount(false, group.organization.id, group.charts);
                cbs.renderSubtree(group.organization.id, group.folders);
            });
            cbs.changeActiveFolder(cur.folder, cur.organization);
            this.dropcallback();
        },
        moveFolderToFolder: function(moved_id, dest) {
            var moved_folder_obj = this.getFolderById(moved_id),
                dest_folder_obj = (dest.folder) ? this.getFolderById(dest.folder) : getRoot(dest.organization),
                source_folder_obj = (moved_folder_obj.parent) ? this.getFolderById(moved_folder_obj.parent) : getRoot(moved_folder_obj.organization);


            if (dest.folder) {
                if (!dest_folder_obj.sub)
                    dest_folder_obj.sub = [];
                dest_folder_obj.sub.push(moved_folder_obj);
                dest_folder_obj.sub.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
            } else {
                dest_folder_obj.folders.push(moved_folder_obj);
                dest_folder_obj.folders.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                });
            }

            if (moved_folder_obj.parent) {
                source_folder_obj.sub = source_folder_obj.sub.filter(function(folder) {
                    return folder.id != moved_id;
                });
                if (source_folder_obj.sub.length === 0)
                    source_folder_obj.sub = false;
            } else {
                source_folder_obj.folders = source_folder_obj.folders.filter(function(folder) {
                    return folder.id != moved_id;
                });
            }

            moved_folder_obj.parent = dest.folder;
            moved_folder_obj.organization = dest.organization;
            this.list = genList();
        },
        moveNChartsTo: function(num, dest) {
            var folder;

            folder = (dest.folder) ? this.list[dest.folder].folder : getRoot(dest.organization);
            folder.charts += num;
            this.rendercallbacks.changeChartCount(dest.folder, dest.organization, folder.charts);

            folder = (this.current.folder) ? this.list[this.current.folder].folder : getRoot(this.current.organization);
            folder.charts -= num;
            this.rendercallbacks.changeChartCount(this.current.folder, this.current.organization, folder.charts);
        },
        removeChartFromCurrent: function() {
            var folder = (this.current.folder) ? this.list[this.current.folder].folder : getRoot(this.current.organization);
            this.rendercallbacks.changeChartCount(this.current.folder, this.current.organization, --folder.charts);
        }
    };

    return ChartFolderTree;
});
