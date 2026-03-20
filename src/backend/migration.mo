import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Int "mo:core/Int";

module {
  type OldSocialUser = {
    id : Nat;
    username : Text;
    passwordHash : Text;
    displayName : Text;
    email : Text;
    country : Text;
    bio : Text;
    avatarUrl : Text;
    userType : Text;
    stageName : ?Text;
    portfolioLink : ?Text;
    activityScore : Int;
    createdAt : Int;
    // isVerified : Bool; <-- Old SocialUser did not have isVerified field
  };

  type OldActor = {
    socialUsers : Map.Map<Nat, OldSocialUser>;
  };

  type NewSocialUser = {
    id : Nat;
    username : Text;
    passwordHash : Text;
    displayName : Text;
    email : Text;
    country : Text;
    bio : Text;
    avatarUrl : Text;
    userType : Text;
    stageName : ?Text;
    portfolioLink : ?Text;
    activityScore : Int;
    createdAt : Int;
    isVerified : Bool;
  };

  type NewActor = {
    socialUsers : Map.Map<Nat, NewSocialUser>;
  };

  public func run(old : OldActor) : NewActor {
    let newSocialUsers = old.socialUsers.map<Nat, OldSocialUser, NewSocialUser>(
      func(_k, oldUser) {
        { oldUser with isVerified = false };
      }
    );
    { socialUsers = newSocialUsers };
  };
};
