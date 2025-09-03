'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { CogIcon, ShieldCheckIcon, BellIcon, CreditCardIcon } from '@heroicons/react/24/outline'

export function SettingsOverview() {
    const [monthlyTarget, setMonthlyTarget] = useState('12000')
    const [currency, setCurrency] = useState('PKR')
    const [notifications, setNotifications] = useState(true)
    const [lowBalanceAlert, setLowBalanceAlert] = useState(true)
    const [largeExpenseAlert, setLargeExpenseAlert] = useState(true)

    const handleSaveSettings = () => {
        // TODO: Implement API call to save settings
        console.log('Saving settings...')
    }

    return (
        <div className="space-y-6">
            {/* General Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <CogIcon className="h-5 w-5 text-gray-600" />
                        <CardTitle>General Settings</CardTitle>
                    </div>
                    <CardDescription>Basic app configuration</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <Label htmlFor="monthlyTarget">Monthly Contribution Target (per member)</Label>
                            <Input
                                id="monthlyTarget"
                                type="number"
                                value={monthlyTarget}
                                onChange={(e) => setMonthlyTarget(e.target.value)}
                                placeholder="12000"
                                className="mt-1"
                            />
                        </div>
                        <div>
                            <Label htmlFor="currency">Currency</Label>
                            <Select value={currency} onValueChange={setCurrency}>
                                <SelectTrigger className="mt-1">
                                    <SelectValue placeholder="Select currency" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="PKR">PKR (Pakistani Rupee)</SelectItem>
                                    <SelectItem value="USD">USD (US Dollar)</SelectItem>
                                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <BellIcon className="h-5 w-5 text-gray-600" />
                        <CardTitle>Notification Settings</CardTitle>
                    </div>
                    <CardDescription>Configure alerts and notifications</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="notifications">Enable Notifications</Label>
                            <p className="text-sm text-gray-600">Receive notifications for important events</p>
                        </div>
                        <Switch
                            id="notifications"
                            checked={notifications}
                            onCheckedChange={setNotifications}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="lowBalanceAlert">Low Balance Alerts</Label>
                            <p className="text-sm text-gray-600">Get notified when balance is running low</p>
                        </div>
                        <Switch
                            id="lowBalanceAlert"
                            checked={lowBalanceAlert}
                            onCheckedChange={setLowBalanceAlert}
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label htmlFor="largeExpenseAlert">Large Expense Alerts</Label>
                            <p className="text-sm text-gray-600">Notify when expenses exceed threshold</p>
                        </div>
                        <Switch
                            id="largeExpenseAlert"
                            checked={largeExpenseAlert}
                            onCheckedChange={setLargeExpenseAlert}
                        />
                    </div>
                </CardContent>
            </Card>

            {/* Expense Categories */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <CreditCardIcon className="h-5 w-5 text-gray-600" />
                        <CardTitle>Expense Categories</CardTitle>
                    </div>
                    <CardDescription>Manage predefined expense categories</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Milk</span>
                            <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Chicken</span>
                            <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Vegetables</span>
                            <Button variant="outline" size="sm">Edit</Button>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <span className="font-medium">Other</span>
                            <Button variant="outline" size="sm">Edit</Button>
                        </div>

                        <Button variant="outline" className="w-full mt-4">
                            + Add New Category
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Security Settings */}
            <Card>
                <CardHeader>
                    <div className="flex items-center space-x-2">
                        <ShieldCheckIcon className="h-5 w-5 text-gray-600" />
                        <CardTitle>Security Settings</CardTitle>
                    </div>
                    <CardDescription>Account security and privacy</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Two-Factor Authentication</Label>
                            <p className="text-sm text-gray-600">Add an extra layer of security to your account</p>
                        </div>
                        <Button variant="outline" size="sm">
                            Enable 2FA
                        </Button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Change Password</Label>
                            <p className="text-sm text-gray-600">Update your account password</p>
                        </div>
                        <Button variant="outline" size="sm">
                            Change Password
                        </Button>
                    </div>

                    <div className="flex items-center justify-between">
                        <div>
                            <Label>Account Deletion</Label>
                            <p className="text-sm text-gray-600">Permanently delete your account and data</p>
                        </div>
                        <Button variant="destructive" size="sm">
                            Delete Account
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button onClick={handleSaveSettings} size="lg">
                    Save Settings
                </Button>
            </div>
        </div>
    )
}
