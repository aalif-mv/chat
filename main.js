const socket = io('https://young-ocean-55252.herokuapp.com/');

socket.on('dm', handleDm);
socket.on('nameTaken', handleNameTaken);
socket.on('stat', handlestat);

const chat = document.getElementById('chatRoom');
const text = document.getElementById('chatText');
const profileInfo = document.getElementById('profileInfo');
const chatContainer = document.getElementById('chat');


let timeOut = null;
let userId = null;
let toClient = null;
let client = null;

function handleDm(dat) {
    let data = JSON.parse(dat);
    const li = document.createElement('li');
    let randId = randomString(50);
    li.classList.add('_msg');
    li.classList.add('_msg_others');
    li.setAttribute('id', randId);
    li.innerHTML = "<h6>"+ toClient +"</h6>" + data.msg.replace('<', '');
    chat.append(li);
    if (data.s != 0 && data.s != undefined) {
        window.setTimeout(() => {
            document.getElementById(randId).remove();
        },data.s * 1000);
    }
}
function dmTo() {
    const li = document.createElement('li');
    let s = text.value.trim().replace('<', '').split(':')[1];
    let randId = randomString(50);
    li.classList.add('_msg');
    li.classList.add('_msg_me');
    li.setAttribute('id', randId);
    li.innerHTML = "<h6>"+ userId +"</h6>" + text.value.trim().replace('<', '').split(':')[0];
    chat.append(li);
    socket.emit('sendToClient', {userId: toClient, msg: text.value.trim().replace('<', '').split(':')[0], s:s});
    if (s != 0 && s != undefined) {
        window.setTimeout(() => {
            document.getElementById(randId).remove();
        },s * 1000);
    }
}
function handlestat(data) {
    let dat = JSON.parse(data);
    if (dat.feedback) {
        if (dat.stat) {
            document.getElementById('_stat').style.backgroundColor = "greenyellow";
        } else {
            document.getElementById('_stat').style.backgroundColor = "rgb(255, 236, 152)";
        }
    }
    if (! dat.feedback) {
        if (toClient == dat.id) {
            document.getElementById('_stat').style.backgroundColor = "greenyellow";
        }
        socket.emit('feedbackStat', {userId: dat.id ,stat: (toClient == dat.id)});
    }
}
function handleNameTaken(recUserId) {
    removeCreateProfile('create');
    alert('name Taken');
}
function setName() {
    if (document.getElementById('userId_tag').value == '') {
        userId = document.getElementById('userId_name').value + ":" + newId(4);
    } else {
        userId = document.getElementById('userId_name').value + ":" + document.getElementById('userId_tag').value;
    }
    userId = userId.toLowerCase();
    localStorage.setItem('userId', userId);
    socket.emit('setName', userId);
    removeCreateProfile('remove');
}
function setClientTo() {
    toClient = document.getElementById('toClient').value.trim().toLowerCase();
    document.getElementById('toClient').value = toClient;
    socket.emit('checkStat', {toClient:toClient, userId:userId});
    document.getElementById('_stat').style.backgroundColor = "rgb(255, 152, 152)";
}
function removeCreateProfile(method) {
    if (method == 'create' && document.getElementById('profileInfo') == null) {
        chatContainer.style.display = 'none';
        let div = document.createElement('div');
        document.body.append(div);
        div.setAttribute('id', 'profileInfo');
        const profTemp = `<div id="userId">
                <input onkeydown="return (/[a-z]/i.test(event.key))" type="text" name="user_Id_name" id="userId_name" maxlength="12" spellcheck="false" required>:
                <input onkeydown="if(event.key == 'Backspace') {return true} if(this.value.length >= 4) {return false}" type="number" name="user_Id_tag" id="userId_tag" max="9999" min="0" required>
            </div>
            <label><input type="checkbox" value="" id="saveCheckbox"><span class="checkmark"></span>Save login info</label>
        <button type="submit" onclick="if(document.getElementById('userId_name').value != '' && document.getElementById('userId_tag').value != ''){setName();}">Save</button"> `
        div.innerHTML = profTemp;
    }
    if (method == 'remove' && document.getElementById('profileInfo') != null) {
        chatContainer.style.display = 'grid';
        document.getElementById('profileInfo').remove();
    }
}
document.body.onload = function loadUser() {
    if (localStorage.getItem('userId') === null) {
        removeCreateProfile('create');
    } else {
        userId = localStorage.getItem('userId');
        socket.emit('setName', userId);
        removeCreateProfile('remove');
    }
}

function alphaOnly(event) {
    var key = event.keyCode;
    return ((key >= 65 && key <= 90) || key == 8);
};

function toDataURL(src, outputFormat) {
    var img = new Image();
    img.crossOrigin = 'Anonymous';
    img.src = src;
    img.onload = function() {
      var canvas = document.createElement('CANVAS');
      var ctx = canvas.getContext('2d');
      var dataURL;
      canvas.height = this.naturalHeight;
      canvas.width = this.naturalWidth;
      ctx.drawImage(this, 0, 0);
      dataURL = canvas.toDataURL(outputFormat);
    }
}

function randomString(length) {
    var result = '';
    var characters = 'ABCDEGHJKMNOPQRSTUVWXYZabcdefghijkmnopqrstvwxyz';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
