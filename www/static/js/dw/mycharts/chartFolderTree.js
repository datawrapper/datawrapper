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
        if (!org_id)
            org_id = false;
        return this.tree.filter(function(group) {
            return (group.organization) ? (group.organization.id === org_id) : (group.organization == org_id);
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
        getFolderOrgById: function(f_id) {
            return (typeof this.list[f_id] !== "undefined") ? this.list[f_id].folder.organization : false;
        },
        setFolderName: function(f_id, name) {
            if (typeof this.list[f_id] !== "undefined")
                this.list[f_id].folder.name = name;
        },
        isParentFolder: function(source, dest) {
            var source_folder_obj = (typeof this.list[source] !== "undefined") ? this.list[source].folder : false,
                dest_folder_obj = (typeof this.list[dest.id] !== "undefined") ? this.list[dest.id].folder : getRoot(dest.organization),
                parent_folder_obj = (source_folder_obj) ? ((source_folder_obj.parent) ? this.list[source_folder_obj.parent].folder : getRoot(source_folder_obj.organization)) : false;

            if (!source_folder_obj) {
                console.warn('Source folder can not be a root folder. Operation prohibited.');
                return true;
            }
            if (parent_folder_obj.id && dest_folder_obj.id) {
                return (parent_folder_obj.id == dest_folder_obj.id)
            } else if (parent_folder_obj.organization.id && dest_folder_obj.organization.id) {
                return (parent_folder_obj.organization.id == dest_folder_obj.organization.id)
            } else if (!dest_folder_obj || !parent_folder_obj) {
                console.warn('You should never get here. Returning true for security reasons');
                return true;
            } else if (!source_folder_obj.organization && !dest_folder_obj.id) {
                 return true;
            } else {
                return false;
            }
        },
        getParentFolder: function(id) {
            var parent = (typeof this.list[id.folder] !== "undefined") ? this.list[id.folder].folder.parent : false,
                parent_folder_obj = (parent) ? this.getFolderById(parent) : getRoot(id.organization);

            return {
                folder: (parent_folder_obj.id) ? parent_folder_obj.id : false,
                organization: (parent_folder_obj.organization) ? ((parent_folder_obj.organization.id) ? parent_folder_obj.organization.id : parent_folder_obj.organization) : false
            };
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
        hasSubFolders: function(f_id) {
            var subfolders = (typeof this.list[f_id] !== "undefined") ? this.list[f_id].folder.sub : false;
            return (subfolders);
        },
        getRootSubFolders: function(org_id) {
            var subfolders;
            if (!org_id) org_id = false;
            subfolders = this.tree.filter(function(group) {
                return (group.organization) ? (group.organization.id === org_id) : (group.organization == org_id);
            })[0].folders;
            return (subfolders) ? subfolders : [];
        },
        isSubfolderOf: function(source, dest) {
            var source_folder_obj = this.getFolderById(source),
                dest_folder_obj = this.getFolderById(dest);

            if (!dest_folder_obj) return false;
            if (!source_folder_obj) {
                console.warn("Root folders can not be moved. Since this id didn't resolve to a folder, further operation is prohibited.");
                return true;
            }

            function traverse(folder) {
                if (folder.id == dest_folder_obj.id) return true;
                if (!folder.sub) return false;

                return folder.sub.reduce(function(ret, sub) {
                    return (ret || traverse(sub));
                }, false);
            }

            return traverse(source_folder_obj);

        },
        getOrgNameById: function(org_id) {
            var org;
            if (!org_id) org_id = false;
            org = this.tree.filter(function(group) {
                return (group.organization) ? (group.organization.id === org_id) : (group.organization == org_id);
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
            this.current_folder_funcs();
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
        addFolder: function(folder) {
            var dest_folder_obj = (folder.parent) ? this.getFolderById(folder.parent) : getRoot(folder.organization),
                dest_array = (folder.parent) ? dest_folder_obj.sub : dest_folder_obj.folders;

            if (folder.parent && !dest_array)  {
                dest_folder_obj.sub = [];
                dest_array = dest_folder_obj.sub;
            }
            dest_array.push(folder);
            dest_array.sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });
            this.list = genList();
        },
        deleteFolder: function(delme) {
            var current = (typeof this.list[delme.folder] !== "undefined") ? this.list[delme.folder].folder : false,
                parent = (current) ? this.list[delme.folder].folder.parent : false,
                parent_folder_obj = (parent) ? this.getFolderById(parent) : getRoot(delme.organization);

            if (parent_folder_obj.id) {
                parent_folder_obj.sub = parent_folder_obj.sub.filter(function(folder) {
                    return folder.id != delme.folder;
                });
            } else {
                parent_folder_obj.folders = parent_folder_obj.folders.filter(function(folder) {
                    return folder.id != delme.folder;
                });
            }
            parent_folder_obj.charts += current.charts; 
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
