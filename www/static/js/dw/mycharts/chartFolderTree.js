define(function() {

    function ChartFolderTree(raw_folders, current, charts) {
        this.tree = genTree(raw_folders);
        this.list = genList(this.tree);
        this.current = current;
        this.charts = charts;
        this.rendercallbacks = {};
        this.current_folder_funcs = {};
        this.search = { active: false };
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
                return (folder.parent === null) ? true : false;
            });
        });

        return raw.sort(function(a, b) {
            if (!a.organization) return -1;
            if (!b.organization) return 1;
            return a.organization.name.localeCompare(b.organization.name);
        });
    }

    function genList(tree) {
        var list = [];

        function traverse(folder, path_obj) {
            if (folder.sub) {
                var new_path_obj = {
                    strings: path_obj.strings.concat(folder.name),
                    ids: path_obj.ids.concat(folder.id)
                };
                folder.sub.forEach(function(sub_folder) {
                    traverse(sub_folder, new_path_obj);
                });
            }
            list[folder.id] = {
                folder: folder,
                path_info: path_obj
            };
        }

        tree.forEach(function(group) {
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
            console.log(this.tree, this.list, this.charts);
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
        isParentFolder: function(child, dest) {
            var child_folder_obj = (typeof this.list[child] !== "undefined") ? this.list[child].folder : false,
                dest_folder_obj = (typeof this.list[dest.id] !== "undefined") ? this.list[dest.id].folder : this.getRoot(dest.organization),
                parent_folder_obj = (child_folder_obj) ? ((child_folder_obj.parent) ? this.list[child_folder_obj.parent].folder : this.getRoot(child_folder_obj.organization)) : false;

            if (!child_folder_obj) {
                console.warn('Source folder can not be a root folder. Operation prohibited.');
                return true;
            }
            if (parent_folder_obj && parent_folder_obj.id) {
                // my parent is a folder
                if (dest_folder_obj && dest_folder_obj.id) {
                    // destination is a folder
                    return parent_folder_obj.id == dest_folder_obj.id;
                }
                return false;
            } else {
                // my parent is a root
                if (dest_folder_obj && dest_folder_obj.id) {
                    // destination is a folder
                    return false;
                }
                // two roots, but are they the same?
                if (dest_folder_obj.organization && parent_folder_obj.organization) {
                    // two organizations!!!
                    return dest_folder_obj.organization.id == parent_folder_obj.organization.id;
                }
                return !(dest_folder_obj.organization || parent_folder_obj.organization);
            }
        },
        isUserToOrgMove: function(drag_data, target) {
            var curFolder = drag_data.type === 'folder' ? this.list[drag_data.id].folder : this.current;
            var curOrg = curFolder ? curFolder.organization : null;
            return (!curOrg && target.organization) || (curOrg != target.organization && target.organization);
        },
        isOrgToUserMove: function(drag_data, target) {
            var curFolder = drag_data.type === 'folder' ? this.list[drag_data.id].folder : this.current;
            var curOrg = curFolder ? curFolder.organization : null;
            return curOrg && !target.organization;
        },
        getParentFolder: function(id) {
            var parent = (typeof this.list[id.folder] !== "undefined") ? this.list[id.folder].folder.parent : false,
                parent_folder_obj = (parent) ? this.getFolderById(parent) : this.getRoot(id.organization);

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
        getRoot: function(org_id) {
            if (!org_id)
                org_id = false;
            return this.tree.filter(function(group) {
                return (group.organization) ? (group.organization.id === org_id) : (group.organization == org_id);
            })[0];
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
        setCurrentPage: function(page) {
            this.current.page = page;
        },
        getCurrentPage: function() {
            return this.current.page;
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
        setSearchActive: function(base_url, q) {
            $('body').addClass('mycharts-search-results');
            this.search.active = true;
            if (!this.search.base_url)
                this.search.base_url = base_url;
            this.search.query = q;
        },
        setSearchDisabled: function() {
            $('body').removeClass('mycharts-search-results');
            this.search.active = false;
            this.search.base_url = null;
        },
        isSearchActive: function() {
            return this.search.active;
        },
        getSearchParams: function() {
            return {
                base_url: this.search.base_url,
                query: this.search.query
            };
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
                dest_folder_obj = (dest.folder) ? this.getFolderById(dest.folder) : this.getRoot(dest.organization),
                source_folder_obj = (moved_folder_obj.parent) ? this.getFolderById(moved_folder_obj.parent) : this.getRoot(moved_folder_obj.organization);


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
            this.list = genList(this.tree);
        },
        addFolder: function(folder) {
            var dest_folder_obj = (folder.parent) ? this.getFolderById(folder.parent) : this.getRoot(folder.organization),
                dest_array = (folder.parent) ? dest_folder_obj.sub : dest_folder_obj.folders;

            if (folder.parent && !dest_array)  {
                dest_folder_obj.sub = [];
                dest_array = dest_folder_obj.sub;
            }
            dest_array.push(folder);
            dest_array.sort(function(a, b) {
                return a.name.localeCompare(b.name);
            });
            this.list = genList(this.tree);
        },
        deleteFolder: function(delme) {
            var current = (typeof this.list[delme.folder] !== "undefined") ? this.list[delme.folder].folder : false,
                parent = (current) ? this.list[delme.folder].folder.parent : false,
                parent_folder_obj = (parent) ? this.getFolderById(parent) : this.getRoot(delme.organization),
                chart_ids = Object.keys(this.charts);

            if (parent_folder_obj.id) {
                parent_folder_obj.sub = parent_folder_obj.sub.filter(function(folder) {
                    return folder.id != delme.folder;
                });
                if (parent_folder_obj.sub.length === 0) {
                    parent_folder_obj.sub = false;
                }
            } else {
                parent_folder_obj.folders = parent_folder_obj.folders.filter(function(folder) {
                    return folder.id != delme.folder;
                });
                if (parent_folder_obj.folders.length === 0) {
                    parent_folder_obj.folders = false;
                }
            }

            chart_ids.forEach(function(id) {
                var chart = this.charts[id];

                if (chart.inFolder == current.id && chart.organizationId == current.organization) {
                    chart.inFolder = (parent_folder_obj.id) ? parent_folder_obj.id : false;
                    chart.organizationId = (parent_folder_obj.organization.id) ? parent_folder_obj.organization.id : parent_folder_obj.organization;
                }
            }, this);

            parent_folder_obj.charts += current.charts; 
            this.list = genList(this.tree);
        },
        moveNChartsTo: function(charts, dest) {
            var num = charts.length,
                folder;

            console.log(charts);
            folder = (dest.folder) ? this.list[dest.folder].folder : this.getRoot(dest.organization);
            folder.charts += num;
            this.rendercallbacks.changeChartCount(dest.folder, dest.organization, folder.charts);

            charts.forEach(function(id) {
                var chart = this.charts[id];

                folder = (chart.inFolder) ? this.list[chart.inFolder].folder : this.getRoot(chart.organizationId);
                folder.charts--;
                this.rendercallbacks.changeChartCount(chart.inFolder, chart.organizationId, folder.charts);
            }, this);
        },
        removeChartFromCurrent: function(chart_id) {
            var folder = (this.current.folder) ? this.list[this.current.folder].folder : this.getRoot(this.current.organization);
            delete this.charts[chart_id];
            this.rendercallbacks.changeChartCount(this.current.folder, this.current.organization, --folder.charts);
        }
    };

    return ChartFolderTree;
});
