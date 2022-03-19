import { mblog } from "../../declarations/mblog";

async function post(){
  let post_button = document.getElementById("post");
  let otp = document.getElementById("otp").value;
  let error = document.getElementById("error");
  error.innerText = "";
  post_button.disabled = true;
  let textarea = document.getElementById("message");
  let text = textarea.value;
  try {
    await mblog.post(otp, text);
    textarea.value = "";
    load_posts();
    load_timeline();
  } catch (err) {
    console.log(err);
    error.innerText = "Post Failed";
  }
  //调用mblog canister的post方法，传otp, text
  //异步调用，指定回调函数时要标注async
  post_button.disabled = false;
}

var num_posts = 0;

async function load_follows(){
  let follows_section = document.getElementById("follows");
  let follows = await mblog.get_follow_data();
  console.log(follows);

  //each followed
  for (var i=0; i <  follows.length; i++){

    console.log(follows[i]);
    let id = follows[i].id;
    let name = follows[i].name 
    if (follows[i].name == ""){
      name = id;
    }

    let followed = document.createElement("a");
    followed.className = "items";
    followed.id = id;
    followed.innerHTML = name;

    followed.addEventListener('click', function handleClick(event) {
      load_posts_by(id, name);
      let items = document.getElementsByClassName("items");
      for (var i=0; i< items.length; i++){
        items[i].classList.remove("show");
      }
      this.classList.add("show");
      console.log('element clicked 🎉🎉🎉', event);
    });
    follows_section.appendChild(followed);
  }

  //all
  let all = document.createElement("a")
  all.className = "items";
  all.innerHTML = "(show all)"
  all.addEventListener('click', function handleClick(event) {
    load_timeline();
    let items = document.getElementsByClassName("items");
      for (var i=0; i< items.length; i++){
        items[i].classList.remove("show");
      }
    this.classList.add("show");
    console.log('element clicked 🎉🎉🎉', event);
  });

  follows_section.appendChild(all);
}

async function load_posts(){
  get_name();
  //document.getElementById("name").innerHTML = author_name;
  let posts_section = document.getElementById("posts");
  let posts = await mblog.posts(0);
  //调用mblog canister的posts方法，传time since
  //异步调用，指定回调函数时要标注async
  //返回posts

  posts_section.replaceChildren([]);
  //alert(posts);
  for (var i=0; i< posts.length; i++){
    let post = document.createElement("p");
    let content = document.createElement("span");
    content.className = "content";
    let author = document.createElement("span");
    author.className = "author";
    let time = document.createElement("span");
    time.className = "time";

    let timestamp = posts[i].time;
    let formattedDateTime = TImeformatter(timestamp);

    author.innerText = posts[i].author;
    content.innerText = posts[i].text;
    time.innerText = formattedDateTime;

    post.appendChild(content);
    post.appendChild(author);
    post.appendChild(time);
    
    posts_section.appendChild(post);
  }
}

async function load_timeline(){
  let posts_section = document.getElementById("posts");
  let author = document.getElementById("name");
  author.innerHTML = "All Posts (timeline)";
  let posts = await mblog.timeline(0);
  console.log(posts);
  //调用mblog canister的posts方法，传time since
  //异步调用，指定回调函数时要标注async
  //返回posts

  //if (num_posts == posts.length) return;
  posts_section.replaceChildren([]);
  //num_posts = posts.length;
  //alert(posts);
  for (var i=0; i< posts.length; i++){
    let post = document.createElement("p");
    let content = document.createElement("span");
    content.className = "content";
    let author = document.createElement("span");
    author.className = "author";
    let time = document.createElement("span");
    time.className = "time";

    let timestamp = posts[i].time;
    let formattedDateTime = TImeformatter(timestamp);
    author.innerText = posts[i].author;
    content.innerText = posts[i].text;
    time.innerText = formattedDateTime;

    post.appendChild(content);
    post.appendChild(author);
    post.appendChild(time);
    
    posts_section.appendChild(post);
  }
}

async function load_posts_by(id, name){
  let author = document.getElementById("name");
  author.innerHTML = name + "'s Posts";
  let posts_section = document.getElementById("posts");
  posts_section.replaceChildren([]);
  let posts = await mblog.postsby(0, id);
  console.log(posts);

  for (var i=0; i< posts.length; i++){
    let post = document.createElement("p");
    let content = document.createElement("span");
    content.className = "content";
    let author = document.createElement("span");
    author.className = "author";
    let time = document.createElement("span");
    time.className = "time";

    let timestamp = posts[i].time;
    let formattedDateTime = TImeformatter(timestamp);
    author.innerText = posts[i].author;
    content.innerText = posts[i].text;
    time.innerText = formattedDateTime;

    post.appendChild(content);
    post.appendChild(author);
    post.appendChild(time);
    
    posts_section.appendChild(post);
  }
}


function TImeformatter(timestamp){
  let d = new Date(Number(timestamp) / 1000000);

  let ye = new Intl.DateTimeFormat('zh', { year: 'numeric' }).format(d);
  let mo = new Intl.DateTimeFormat('zh', { month: 'short' }).format(d);
  let da = new Intl.DateTimeFormat('zh', { day: '2-digit' }).format(d);
  let hr = new Intl.DateTimeFormat('zh', { hour: 'numeric' }).format(d);
  let mi = new Intl.DateTimeFormat('zh', { minute: '2-digit' }).format(d);

  return ye + mo + da + " " + hr + mi + "分";
}

var author_name = "";

async function get_name(){
  if (author_name == "") {
    author_name = await mblog.get_name();
  }
  document.getElementById("author").innerText = author_name;
}

function load() {
  get_name();
  let post_button = document.getElementById("post");
  post_button.onclick = post;
  load_follows();
  load_timeline();
}

window.onload = load;
