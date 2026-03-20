import Map "mo:core/Map";
import Text "mo:core/Text";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Float "mo:core/Float";
import Order "mo:core/Order";
import Runtime "mo:core/Runtime";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";
import MixinStorage "blob-storage/Mixin";

actor {
  include MixinStorage();

  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ─── Existing Profile Types ───────────────────────────────────────────────

  type Profile = {
    id : Nat;
    name : Text;
    country : Text;
    photoUrl : Text;
    bio : Text;
    email : ?Text;
    socialMedia : ?Text;
    createdAt : Int;
  };

  module Profile {
    public func compare(p1 : Profile, p2 : Profile) : Order.Order {
      Nat.compare(p1.id, p2.id);
    };
  };

  func compareCountryTuple(t1 : (Text, Nat), t2 : (Text, Nat)) : Order.Order {
    Text.compare(t1.0, t2.0);
  };

  type Review = {
    id : Nat;
    profileId : Nat;
    authorName : Text;
    rating : Nat;
    comment : Text;
    createdAt : Int;
  };

  var nextId = 1;
  var nextReviewId = 1;
  let profiles = Map.empty<Nat, Profile>();
  let reviews = Map.empty<Nat, Review>();
  let likeCounts = Map.empty<Nat, Nat>();

  // ─── Social: User Accounts ────────────────────────────────────────────────

  type SocialUser = {
    id : Nat;
    username : Text;
    passwordHash : Text;
    displayName : Text;
    country : Text;
    bio : Text;
    avatarUrl : Text;
    createdAt : Int;
  };

  type Post = {
    id : Nat;
    authorId : Nat;
    imageUrl : Text;
    caption : Text;
    createdAt : Int;
  };

  func comparePostsDesc(p1 : Post, p2 : Post) : Order.Order {
    switch (Int.compare(p1.createdAt, p2.createdAt)) {
      case (#less) { #greater };
      case (#greater) { #less };
      case (#equal) { #equal };
    };
  };

  type PostComment = {
    id : Nat;
    postId : Nat;
    authorId : Nat;
    authorName : Text;
    text : Text;
    createdAt : Int;
  };

  var nextUserId = 1;
  var nextPostId = 1;
  var nextCommentId = 1;

  let socialUsers = Map.empty<Nat, SocialUser>();
  let usersByUsername = Map.empty<Text, Nat>();
  let posts = Map.empty<Nat, Post>();
  let postLikes = Map.empty<Text, Bool>();
  let postLikeCounts = Map.empty<Nat, Nat>();
  let postComments = Map.empty<Nat, PostComment>();

  // ─── Existing Profile Methods ─────────────────────────────────────────────

  public shared func createProfile(name : Text, country : Text, photoUrl : Text, bio : Text, email : ?Text, socialMedia : ?Text) : async Nat {
    let profile : Profile = {
      id = nextId;
      name; country; photoUrl; bio; email; socialMedia;
      createdAt = Int.fromNat(0);
    };
    profiles.add(nextId, profile);
    nextId += 1;
    profile.id;
  };

  public shared func updateProfile(id : Nat, name : Text, country : Text, photoUrl : Text, bio : Text, email : ?Text, socialMedia : ?Text) : async () {
    let existing = switch (profiles.get(id)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?e) { e };
    };
    profiles.add(id, { id; name; country; photoUrl; bio; email; socialMedia; createdAt = existing.createdAt });
  };

  public shared func deleteProfile(id : Nat) : async () {
    if (not profiles.containsKey(id)) Runtime.trap("Profile does not exist");
    profiles.remove(id);
    likeCounts.remove(id);
  };

  public query func getProfiles() : async [Profile] {
    profiles.values().toArray().sort();
  };

  public query func getProfile(id : Nat) : async Profile {
    switch (profiles.get(id)) {
      case (null) { Runtime.trap("Profile does not exist") };
      case (?p) { p };
    };
  };

  public query func searchProfiles(searchTerm : Text) : async [Profile] {
    let lower = searchTerm.toLower();
    profiles.values().toArray().filter(func(p) {
      p.name.toLower().contains(#text(lower)) or p.country.toLower().contains(#text(lower));
    }).sort();
  };

  public query func getProfilesByCountry(country : Text) : async [Profile] {
    let lower = country.toLower();
    profiles.values().toArray().filter(func(p) {
      p.country.toLower().contains(#text(lower));
    }).sort();
  };

  public query func getCountries() : async [(Text, Nat)] {
    let countries = profiles.values().toArray().values().foldLeft(
      Map.empty<Text, Nat>(),
      func(map, p) {
        let c = switch (map.get(p.country)) { case (null) 0; case (?n) n };
        map.add(p.country, c + 1);
        map;
      },
    );
    countries.toArray().sort(compareCountryTuple);
  };

  public shared func addReview(profileId : Nat, authorName : Text, rating : Nat, comment : Text) : async Nat {
    if (rating < 1 or rating > 5) Runtime.trap("Rating must be between 1 and 5");
    switch (profiles.get(profileId)) { case (null) Runtime.trap("Profile does not exist"); case (?_) {} };
    let review : Review = { id = nextReviewId; profileId; authorName; rating; comment; createdAt = Int.fromNat(nextReviewId) };
    reviews.add(nextReviewId, review);
    nextReviewId += 1;
    review.id;
  };

  public query func getReviews(profileId : Nat) : async [Review] {
    reviews.values().toArray().filter(func(r) { r.profileId == profileId });
  };

  public query func getAverageRating(profileId : Nat) : async ?Float {
    let rs = reviews.values().toArray().filter(func(r) { r.profileId == profileId });
    let count = rs.size();
    if (count == 0) return null;
    let sum = rs.foldLeft(0, func(acc, r) { acc + r.rating });
    ?(sum.toFloat() / count.toFloat());
  };

  public shared func likeProfile(profileId : Nat) : async () {
    if (not profiles.containsKey(profileId)) Runtime.trap("Profile does not exist");
    let c = switch (likeCounts.get(profileId)) { case (null) 0; case (?n) n };
    likeCounts.add(profileId, c + 1);
  };

  public query func getLikeCount(profileId : Nat) : async Nat {
    switch (likeCounts.get(profileId)) { case (null) 0; case (?n) n };
  };

  // ─── Social: User Auth ────────────────────────────────────────────────────

  public shared func registerUser(username : Text, passwordHash : Text, displayName : Text, country : Text, bio : Text, avatarUrl : Text) : async Nat {
    if (usersByUsername.containsKey(username)) Runtime.trap("Username already taken");
    let user : SocialUser = {
      id = nextUserId;
      username; passwordHash; displayName; country; bio; avatarUrl;
      createdAt = Int.fromNat(nextUserId);
    };
    socialUsers.add(nextUserId, user);
    usersByUsername.add(username, nextUserId);
    nextUserId += 1;
    user.id;
  };

  public query func loginUser(username : Text, passwordHash : Text) : async ?Nat {
    switch (usersByUsername.get(username)) {
      case (null) null;
      case (?uid) {
        switch (socialUsers.get(uid)) {
          case (null) null;
          case (?u) {
            if (u.passwordHash == passwordHash) ?uid else null;
          };
        };
      };
    };
  };

  public query func getSocialUser(userId : Nat) : async SocialUser {
    switch (socialUsers.get(userId)) {
      case (null) Runtime.trap("User does not exist");
      case (?u) u;
    };
  };

  public shared func updateSocialUser(userId : Nat, displayName : Text, country : Text, bio : Text, avatarUrl : Text) : async () {
    let existing = switch (socialUsers.get(userId)) {
      case (null) Runtime.trap("User does not exist");
      case (?u) u;
    };
    socialUsers.add(userId, {
      id = userId;
      username = existing.username;
      passwordHash = existing.passwordHash;
      displayName; country; bio; avatarUrl;
      createdAt = existing.createdAt;
    });
  };

  public query func getAllSocialUsers() : async [SocialUser] {
    socialUsers.values().toArray();
  };

  // ─── Social: Posts ────────────────────────────────────────────────────────

  public shared func createPost(authorId : Nat, imageUrl : Text, caption : Text) : async Nat {
    if (not socialUsers.containsKey(authorId)) Runtime.trap("User does not exist");
    let post : Post = {
      id = nextPostId;
      authorId; imageUrl; caption;
      createdAt = Int.fromNat(nextPostId);
    };
    posts.add(nextPostId, post);
    nextPostId += 1;
    post.id;
  };

  public query func getPosts() : async [Post] {
    posts.values().toArray().sort(comparePostsDesc);
  };

  public query func getPostsByUser(userId : Nat) : async [Post] {
    posts.values().toArray().filter(func(p) { p.authorId == userId }).sort(comparePostsDesc);
  };

  public shared func deletePost(postId : Nat) : async () {
    if (not posts.containsKey(postId)) Runtime.trap("Post does not exist");
    posts.remove(postId);
    postLikeCounts.remove(postId);
  };

  // ─── Social: Post Likes ───────────────────────────────────────────────────

  public shared func likePost(postId : Nat, userId : Nat) : async () {
    if (not posts.containsKey(postId)) Runtime.trap("Post does not exist");
    let key = postId.toText() # ":" # userId.toText();
    if (not postLikes.containsKey(key)) {
      postLikes.add(key, true);
      let c = switch (postLikeCounts.get(postId)) { case (null) 0; case (?n) n };
      postLikeCounts.add(postId, c + 1);
    };
  };

  public shared func unlikePost(postId : Nat, userId : Nat) : async () {
    let key = postId.toText() # ":" # userId.toText();
    if (postLikes.containsKey(key)) {
      postLikes.remove(key);
      let c = switch (postLikeCounts.get(postId)) { case (null) 0; case (?n) n };
      postLikeCounts.add(postId, Nat.max(0, if (c > 0) c - 1 else 0));
    };
  };

  public query func getPostLikeCount(postId : Nat) : async Nat {
    switch (postLikeCounts.get(postId)) { case (null) 0; case (?n) n };
  };

  public query func hasUserLikedPost(postId : Nat, userId : Nat) : async Bool {
    let key = postId.toText() # ":" # userId.toText();
    postLikes.containsKey(key);
  };

  // ─── Social: Comments ─────────────────────────────────────────────────────

  public shared func addPostComment(postId : Nat, authorId : Nat, authorName : Text, text : Text) : async Nat {
    if (not posts.containsKey(postId)) Runtime.trap("Post does not exist");
    let c : PostComment = {
      id = nextCommentId;
      postId; authorId; authorName; text;
      createdAt = Int.fromNat(nextCommentId);
    };
    postComments.add(nextCommentId, c);
    nextCommentId += 1;
    c.id;
  };

  public query func getPostComments(postId : Nat) : async [PostComment] {
    postComments.values().toArray().filter(func(c) { c.postId == postId });
  };

  public shared func deletePostComment(commentId : Nat) : async () {
    if (not postComments.containsKey(commentId)) Runtime.trap("Comment does not exist");
    postComments.remove(commentId);
  };
};
