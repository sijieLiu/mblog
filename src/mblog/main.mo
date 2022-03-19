import List "mo:base/List";
import Iter "mo:base/Iter";
import Int "mo:base/Int";
import Time "mo:base/Time";
import Principal "mo:base/Principal";

actor Mblog {

  public type Message = {
    author: Text;
    text: Text;
    time : Time.Time;
  };

  public type User = {
    name: ?Text;
    id: Principal;
  };

  public type Microblog = actor {
    follow: shared(Principal) -> async();
    follows: shared query() -> async[Principal];
    post: shared(Text, Text) -> async();
    posts: shared query(Time.Time) -> async[Message];
    timeline: shared(Time.Time) -> async[Message];
    get_name: shared query() -> async ?Text;
    get_follow_data: shared query() -> async [User];
  };

  stable var followed : List.List<Principal> = List.nil(); //empty list

  stable var _author : Text = "";

  public shared (msg) func set_name(name: Text) : async() {
    _author := name;
  };

  public shared query func get_name(): async Text{
    _author
  };

  public shared func follow(id: Principal) : async(){
    followed := List.push(id, followed)
  };

  public shared query func follows() : async [Principal]{
    List.toArray(followed);
  };

  stable var messages : List.List<Message> = List.nil();
 
  public shared(msg) func post(otp: Text, text: Text) : async(){
    assert(otp == "123456");
    let message = {
      author = _author;
      text = text;
      time = Time.now();
    };
    messages := List.push(message, messages)
  };
  
  public shared query func posts(since: Time.Time) : async [Message]{
    var posts : List.List<Message> = List.nil();

    for (msg in Iter.fromList(messages)){
      if (msg.time >= since) { //filter since
        posts := List.push(msg, posts);
      }
    };

    List.toArray(posts)
  };

  public shared func timeline(since: Time.Time) : async [Message]{
    var all : List.List<Message> = List.nil();

    for (user in Iter.fromList(followed)){
      let canister : Microblog = actor(Principal.toText(user));
      let msgs = await canister.posts(since); //msgs since
      for (msg in Iter.fromArray(msgs)){
        all := List.push(msg, all)
      }
    };

    List.toArray(all)
  };

  public shared func get_follow_data() : async [User]{
    var follow_data : List.List<User> = List.nil();
    for (id in Iter.fromList(followed)){
      let canister : Microblog = actor(Principal.toText(id));
      let n = await canister.get_name();
      let u : User = {name = n; id = id; };
      follow_data := List.push(u, follow_data);
    };
    List.toArray(follow_data)
  };

  public shared func postsby(since: Time.Time, id: Principal) : async [Message]{
    let canister : Microblog = actor(Principal.toText(id));
    await canister.posts(since); //msgs since
  }
};
