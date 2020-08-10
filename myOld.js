var TODAY
var UID
var audio = document.getElementById('S')
firebase.auth().onAuthStateChanged((user) => {
    if (user) {
        UID = user.uid
    } else {
        alert("logging out")
        window.location.replace('index.html')
    }
})

function live() {
    console.log('live')
    document.getElementById('livebtn').disabled=true
    document.getElementById('loading').innerHTML = 'live started, record mode set to 1'
    var dt = TODAY
    var dtparts = dt.split('-')
    var dt = dtparts[2] + dtparts[1] + dtparts[0].substring(2, 4)
    audio.src = "data:audio/wav;base64,"
    firebase.database().ref(document.getElementById('devices-list').value + '/settings/record_mode').set('2')
    console.log('')
    var i = 0;
    var dataq = ''
    firebase.database().ref(document.getElementById('devices-list').value + '/Audio/' + dt + '/Online/').set(null)
    const database = firebase.database().ref(document.getElementById('devices-list').value + '/Audio/' + dt + '/Online/').on('child_added', (sn) => {
        // console.log('snapshot loaded')
        dataq = dataq + sn.val().toString().replace("Data:", "")
        i = i + 1
        console.log(i)
        // audio.load()
        document.getElementById('loading').innerHTML = 'Parts '+i +'received'
        if (i >= 10) {
            var t=audio.currentTime
            audio.src = audio.src + dataq
            audio.load()
            audio.currentTime=t
            console.log(audio.src.length, audio.duration)
            i = 0
            console.log('jjjj')
            dataq = ''
            document.getElementById('loading').innerHTML = 'Loaded 20 parts'
            // audio.pause()
            // audio.load()
            // audio.play()
        }
    })

}


document.getElementById('signout').addEventListener('click', () => {
    firebase.auth().signOut()
})

document.addEventListener('DOMContentLoaded', () => {
    var d = new Date();
    var month = d.getMonth() + 1
    if (month.toString().length == 1) {
        month = '0' + month;
    }
    var date = d.getDate()
    if (date.toString().length == 1) {
        date = '0' + date;
    }
    var comm = d.getFullYear() + '-' + month + '-' + date
    TODAY = comm
    document.getElementById('RecordingDate').value = comm
    document.getElementById('RecordingDate').setAttribute('max', comm)
    // load(comm)
})

document.getElementById('RecordingDate').addEventListener('change', () => {
    console.log('changed date')
    reloadAud()
})

document.getElementById('devices-list').addEventListener('change', () => {
    console.log('changed device')
    reloadAud()
})

document.getElementById('linkNew').addEventListener('click', () => {
    $('#exampleModal').modal('show')
    document.getElementById('confirmlink').addEventListener('click', () => {
        console.log('added')
        var devId = document.getElementById('DevId').value
        var devPwd = document.getElementById('DevPwd').value
        firebase.database().ref(devId + '/Pass/').once('value', s => {
            if (s.val() == devPwd) {
                console.log(devId)
                firebase.database().ref('devLink/' + UID).once('value', sn => {
                    var flag = 0
                    sn.forEach(s => {
                        if (s.val() == devId) {
                            flag = 1
                            console.log('exists')
                        }
                    })
                    if (flag == 0) {
                        firebase.database().ref('devLink/' + UID + '/').push(devId, function (error) {
                            if (error) {
                                $(document).ready(function () {
                                    $('.toast').toast({ delay: 3000 })
                                    $('#alertmsg').html("Error " + error)
                                    $('.toast').toast('show');
                                });
                            } else {
                                $('#exampleModal').modal('hide')
                                $(document).ready(function () {
                                    $('.toast').toast({ delay: 3000 })
                                    $('#alertmsg').html("Successfully Linked")
                                    $('.toast').toast('show');
                                });
                            }
                        })
                    }
                })
            }
            else {
                $(document).ready(function () {
                    $('.toast').toast({ delay: 3000 })
                    $('#alertmsg').html("INVALID Credentials")
                    $('.toast').toast('show');
                });
            }
        })
        $('#exampleModal').modal('hide')
    })
})

// loading linked devices
document.addEventListener('DOMContentLoaded', () => {
    firebase.database().ref('devLink/').on('value', (sn) => {
        // console.log(sn.val(), UID, 'hui', sn.key)
        console.log(UID, 'lll')

        var select = document.getElementById("devices-list");//RESET
        //EMPTY RESET LIST
        var length = select.options.length;
        for (i = length - 1; i >= 1; i--) {
            select.options[i] = null;
        }
        sn.child(UID).forEach(s1 => {
            console.log(s1.key, s1.val())
            var option = document.createElement("option");
            option.text = s1.val()
            select.add(option);

        })
        document.getElementById('devices-list-option').innerHTML = "Select device"
    })
})

function reloadAud() {
    document.getElementById('loading').innerHTML = 'Loading..'
    var dt = document.getElementById('RecordingDate').value
    // var dt=TODAY
    console.log(TODAY, 'today')
    var dtparts = dt.split('-')
    var DEVID
    var data1 = ''
    var audio = document.getElementById('S');
    var dt = dtparts[2] + dtparts[1] + dtparts[0].substring(2, 4)
    var selecedDev = document.getElementById('devices-list').value
    console.log(dt, selecedDev)
    var i=0
    // audio.src="data:audio/wav;base64,"
    firebase.database().ref(selecedDev + '/Audio/' + dt + '/Recorded/').once('value', function (snapshot) {
        // console.log(snapshot.key,snapshot.val(),sn.val(),dt)
        snapshot.forEach(element => {
            i=i+1
            data1 = data1 + element.val().toString().replace("Data:", "")
            // data1 =  element.val().toString().replace("Data:", "")  
            console.log(data1.length,i)
            // if(i>=10){
                // audio.src=audio.src+data1
            //     data1=''
            //     i=0
            // }

        }
        );
        // console.log(data1, data1.length)
        audio.src="data:audio/wav;base64,"+data1
        if (data1 == "") {
            document.getElementById('loading').innerHTML = 'No Recording found, Choose a different date or Valid Device'
        }
        else {
            document.getElementById('loading').innerHTML = 'loaded successfully'
        }

        // audio.src = "data:audio/wav;base64," + data1
        // audio.src="file:///C:/newaudio/public/t.mp3"
        console.log("data:audio/wav;base64," + data1)

        // audio.play()

        // localStorage.setItem(DEVID+'aud'+dt, "data:audio/wav;base64," + data1)
        // console.log("read from db and stored" + localStorage.getItem(DEVID+'aud'+dt))
    });


}


var element = document.getElementById('watchdiv');
element.addEventListener('DOMSubtreeModified', function () {
    element = document.getElementById('watchdiv');
    var MutationObserver = window.MutationObserver
        || window.WebKitMutationObserver
        || window.MozMutationObserver;
    var observer = new MutationObserver(function () {
        // do something
        console.log("check7 value changed to "
            + element.innerHTML);
    });
    observer.observe(element, { childList: true });
});

// function reloadAud1() {
//     document.getElementById('loading').innerHTML = 'Loading..'
//     var dt = document.getElementById('RecordingDate').value
//     // var dt=TODAY
//     console.log(TODAY, 'today')
//     var dtparts = dt.split('-')
//     var DEVID
//     var data1 = ''
//     var audio = document.getElementById('S');
//     var dt = dtparts[2] + dtparts[1] + dtparts[0].substring(2, 4)
//     var selecedDev = document.getElementById('devices-list').value
//     console.log(dt, selecedDev)

// }
