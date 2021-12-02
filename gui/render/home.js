var fs = require('fs');
var os = require('os');

var root_path = "/home/" + os.userInfo().username + "/vault";
var rel_path = "/";
var curren_path = rel_path;
var list = document.getElementById("list");

show_dir("/");
update_dir_click();

function show_dir(path) {
    let content = fs.readdirSync(root_path + path, { withFileTypes: true });

    curren_path = path;

    var html = "";

    if (path === rel_path && content.length === 0) {
        html = "<div>Your vault is empty!</div>";
        list.innerHTML = html;
        return;
    }

    var path_tmp = path;

    content.forEach((v, i) => {
        let arr = [];

        Reflect.ownKeys(v).forEach(function (name) {
            arr.push(v[name]);
        });

        if (arr[1] === 2) {
            path_tmp = path + arr[0] + "/";
            html = html + "<div class='dir' name='" + path_tmp + "'>dic: <a href=\"javascript:show_dir('" + path_tmp + "');\">" + arr[0] + "</a></div>";
        } else {
            path_tmp = path + arr[0];
            html = html + "<div>file: <a href=\"javascript:show_content('" + path_tmp + "');\">" + arr[0] + "</a></div>";
        }

    });

    if (path !== rel_path) {
        path = path.slice(0, path.length - 1);
        path = path.slice(0, path.lastIndexOf("/") + 1);

        html = html + "<br><div><a href=\"javascript:show_dir('" + path + "');\">back</a></div>";
    }

    list.innerHTML = html;
    update_dir_click();
}

function show_content(path) {
    const data = fs.readFileSync(root_path + path, 'utf8');

    var html = "<div style='white-space: pre-line;'>" + data + "</div>";

    list.innerHTML = html;

    if (path !== rel_path) {
        path = path.slice(0, path.lastIndexOf("/") + 1);

        html = html + "<br><div><a href=\"javascript:show_dir('" + path + "');\">back</a></div>";
    }

    list.innerHTML = html;
}

const { remote } = require('electron');
const prompt = require('electron-prompt');

var rigthTemplate = [
    {
        label: 'create new directory',
        click: function () {
            prompt({
                title: 'Create New Directory',
                label: 'Directory name: ',
                type: 'input'
            }).then((r) => {
                if (r !== null) {
                    if (r.length === 0) {
                        alert('Please enter a directory name!');
                    } else {
                        fs.mkdir(root_path + curren_path + r, (error) => {
                            if (error) throw error;
                            show_dir(curren_path);
                        });
                    }
                }
            }).catch(console.error);
        }
    },
];

var m = remote.Menu.buildFromTemplate(rigthTemplate);

window.addEventListener('contextmenu', function (e) {
    e.preventDefault();
    m.popup({ window: remote.getCurrentWindow() });
})

function update_dir_click() {
    const { remote } = require('electron');
    var dir = document.getElementsByClassName("dir");

    for (let i = 0; i < dir.length; ++i) {
        dir[i].oncontextmenu = function (event) {
            event.stopPropagation();
            var path_tmp = dir[i].getAttribute("name");
            var rigthTemplate = [
                {
                    label: 'open',
                    click: function () {
                        show_dir(path_tmp);
                    }
                },
                {
                    label: 'delete',
                    click: function () {
                        fs.rmdir(root_path + path_tmp, { recursive: true }, function (error) {
                            if (error) throw error;
                            path_tmp = path_tmp.slice(0, path_tmp.length - 1);
                            path_tmp = path_tmp.slice(0, path_tmp.lastIndexOf("/") + 1);
                            show_dir(path_tmp);
                        })
                    }
                },
                {
                    label: 'rename',
                    click: function () {
                        prompt({
                            title: 'Rename Directory',
                            label: 'New name: ',
                            type: 'input'
                        }).then((r) => {
                            if (r !== null) {
                                if (r.length === 0) {
                                    alert('Please enter a new directory name!');
                                } else {
                                    var path_tmp1 = path_tmp;
                                    path_tmp = path_tmp.slice(0, path_tmp.length - 1);
                                    path_tmp = path_tmp.slice(0, path_tmp.lastIndexOf("/") + 1);
                                    fs.rename(root_path + path_tmp1, root_path + path_tmp + r, function (error) {
                                        if (error) throw error;
                                        show_dir(path_tmp);
                                    })
                                }
                            }
                        }).catch(console.error);
                    }
                },
            ];

            var m = remote.Menu.buildFromTemplate(rigthTemplate);
            m.popup({ window: remote.getCurrentWindow() });
        };
    }
}


// test.addEventListener('contextmenu', event => {
//     // event.preventDefault();
//     event.stopPropagation();
//     console.log("hello");
//     m1.popup({ window: remote.getCurrentWindow() });
//     // if(event.preventDefault){event.preventDefault(); } else {event.returnValue = false; }
// });