import { FormEvent, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { getUserProfile, updateUserProfile, SignupPayload } from "@/services/api";
import { useAuthContext } from "@/context/AuthContext";
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  Shield,
  CheckCircle2
} from "lucide-react";

const MyAccountPage = () => {
  const { toast } = useToast();
  const { logout } = useAuthContext();
  const qc = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<SignupPayload>>({});

  // Fetch user profile
  const profileQuery = useQuery({
    queryKey: ["user-profile"],
    queryFn: async () => {
      const response = await getUserProfile();
      return response.data;
    },
  });

  // Update profile mutation
  const updateMutation = useMutation({
    mutationFn: updateUserProfile,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["user-profile"] });
      toast({ title: "Profile updated successfully!" });
      setIsEditing(false);
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || "Failed to update profile";
      toast({
        title: "Update failed",
        description: msg,
        variant: "destructive",
      });
    },
  });

  // Initialize form data when profile loads
  useEffect(() => {
    if (profileQuery.data) {
      setFormData({
        firstName: profileQuery.data.firstName,
        lastName: profileQuery.data.lastName,
        username: profileQuery.data.username,
        email: profileQuery.data.email,
        address: profileQuery.data.address,
        contactNumber: profileQuery.data.contactNumber,
        city: profileQuery.data.city,
        state: profileQuery.data.state,
      });
    }
  }, [profileQuery.data]);

  // Handle auth errors
  useEffect(() => {
    if (profileQuery.error) {
      const err = profileQuery.error as any;
      if (err?.message === "AUTH_EXPIRED") logout();
    }
  }, [profileQuery.error, logout]);

  const handleInputChange = (field: keyof SignupPayload, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = (e: FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleCancel = () => {
    if (profileQuery.data) {
      setFormData({
        firstName: profileQuery.data.firstName,
        lastName: profileQuery.data.lastName,
        username: profileQuery.data.username,
        email: profileQuery.data.email,
        address: profileQuery.data.address,
        contactNumber: profileQuery.data.contactNumber,
        city: profileQuery.data.city,
        state: profileQuery.data.state,
      });
    }
    setIsEditing(false);
  };

  if (profileQuery.isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Account</h1>
        </div>
        <Card variant="glass">
          <CardContent className="p-6 text-center">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4" />
            <p className="text-muted-foreground">Loading profile...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (profileQuery.error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">My Account</h1>
        </div>
        <Card variant="glass" className="border-red-500/50 bg-red-500/10">
          <CardContent className="p-6 text-center">
            <X className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-600 mb-2">Failed to load profile</h3>
            <p className="text-muted-foreground mb-4">
              Unable to fetch your profile information. Please try again.
            </p>
            <Button onClick={() => profileQuery.refetch()} variant="outline">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const profile = profileQuery.data;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold">My Account</h1>
          <p className="text-muted-foreground">
            Manage your personal information and account settings
          </p>
        </motion.div>
        
        {!isEditing ? (
          <Button
            onClick={() => setIsEditing(true)}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Edit3 className="w-4 h-4" />
            Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              {updateMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancel
            </Button>
          </div>
        )}
      </div>

      {/* Profile Overview */}
      <Card variant="glass">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-success flex items-center justify-center">
              <User className="w-8 h-8 text-primary-foreground" />
            </div>
            <div>
              <h2 className="text-2xl font-bold">
                {profile?.firstName} {profile?.lastName}
              </h2>
              <p className="text-muted-foreground">@{profile?.username}</p>
              <div className="flex items-center gap-2 mt-1">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-green-600">Verified Account</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Personal Information */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={formData.firstName || ""}
                  onChange={(e) => handleInputChange("firstName", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={formData.lastName || ""}
                  onChange={(e) => handleInputChange("lastName", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Information */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-primary" />
              Account Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  value={formData.username || ""}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              Contact Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="contactNumber">Contact Number</Label>
                <Input
                  id="contactNumber"
                  value={formData.contactNumber || ""}
                  onChange={(e) => handleInputChange("contactNumber", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={formData.address || ""}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  disabled={!isEditing}
                  className={!isEditing ? "bg-muted" : ""}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={formData.city || ""}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={formData.state || ""}
                    onChange={(e) => handleInputChange("state", e.target.value)}
                    disabled={!isEditing}
                    className={!isEditing ? "bg-muted" : ""}
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Information */}
        <Card variant="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Security
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between p-4 bg-secondary/50 rounded-lg">
              <div>
                <h4 className="font-medium">Password</h4>
                <p className="text-sm text-muted-foreground">
                  Last updated: Never (using default password)
                </p>
              </div>
              <Button variant="outline" size="sm" disabled>
                Change Password
                <span className="text-xs ml-2">(Coming Soon)</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>

      {/* Account Stats */}
      <Card variant="glass">
        <CardHeader>
          <CardTitle>Account Statistics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-2xl font-bold text-primary">#{profile?.id}</div>
              <div className="text-sm text-muted-foreground">User ID</div>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">Active</div>
              <div className="text-sm text-muted-foreground">Account Status</div>
            </div>
            <div className="text-center p-4 bg-secondary/50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">Member</div>
              <div className="text-sm text-muted-foreground">Account Type</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MyAccountPage;