import AdminLayout from '@components/layout/pageLayout/AdminLayout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import OrderStatusBadge from '@components/common/Badge/OrderStatusBadge';
import NoticeAlert from '@components/common/NoticeAlert';
import { KPI_METRICS, RECENT_ORDERS } from '@fixtures/dashboard.fixture';
import AdminSectionHeader from '@components/common/section/AdminSectionHeader';
import { useGetAllUsers } from '@api/user/user.hooks';
import { useAllCategories } from '@api/category/category.hooks';
import { Spinner } from '@components/ui/spinner';
import { ChartBarStacked, Users } from 'lucide-react';
import {
  DashboardMetricCard,
  DashboardMetricCardSkeleton,
} from '@components/common/cards/DashboardMetricCard';
import { useState } from 'react';
import { PaginationComponent } from '@components/common/pagination/Pagination';

const AdminDashboard = () => {
  const [page, setPage] = useState(0);
  const {
    data: usersData,
    isPending: userPending,
    isError: userError,
  } = useGetAllUsers({ page, size: 5 });
  const {
    data: categoriesData,
    isPending: categoriesPending,
    isError: categoriesError,
  } = useAllCategories();

  return (
    <AdminLayout>
      <AdminSectionHeader
        title="Dashboard"
        description="Overview of your store's performance."
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {KPI_METRICS.map((metric, index) => (
          <DashboardMetricCard
            key={index}
            value={metric.value}
            title={metric.title}
            description={metric.description}
            icon={metric.icon}
            error={false}
            errorMessage={''}
          />
        ))}
        {userPending ? (
          <DashboardMetricCardSkeleton />
        ) : (
          <DashboardMetricCard
            key="total-users"
            value={usersData?.totalElements.toString() ?? 'N/A'}
            title="Total Users"
            description={
              usersData?.totalElements.toString()
                ? 'Number of users registered'
                : 'No user data'
            }
            icon={Users}
            error={userError}
            errorMessage={'Failed to load users. Please try again later.'}
          />
        )}
        {categoriesPending ? (
          <DashboardMetricCardSkeleton />
        ) : (
          <DashboardMetricCard
            key="total-categories"
            value={categoriesData ? categoriesData.length.toString() : 'N/A'}
            title="Total Categories"
            description={
              categoriesData ? 'Number of categories' : 'No category data'
            }
            icon={ChartBarStacked}
            error={categoriesError}
            errorMessage={'Failed to load categories. Please try again later.'}
          />
        )}
      </div>

      {userError && (
        <NoticeAlert
          variant="error"
          message="An error occurred while loading the data. Please try again later."
        />
      )}

      {userPending && !userError && (
        <div className="flex justify-center items-center p-8">
          <Spinner className="size-8 text-primary" />
        </div>
      )}

      {!userPending && !userError && usersData && (
        <Card className="border-border shadow-sm">
          <CardHeader>
            <CardTitle>Recent Users</CardTitle>
            <CardDescription>
              Overview of the latest registered users.
            </CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-25 sm:w-30">ID</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Email</TableHead>
                  <TableHead className="text-right">Phone</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {usersData.content.map(user => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.id}</TableCell>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground">
                      {user.email}
                    </TableCell>
                    <TableCell className="text-right">{user.phone}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {usersData.totalPages > 1 && (
              <div className="mt-4">
                <PaginationComponent
                  currentPage={usersData.number}
                  totalPages={usersData.totalPages}
                  onPageChange={setPage}
                />
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>
            You made {RECENT_ORDERS.length} sales this week.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-25 sm:w-30">Order</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead className="hidden sm:table-cell">Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_ORDERS.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>
                    <div className="font-medium">{order.customer}</div>
                    <div className="text-xs text-muted-foreground hidden sm:block">
                      {order.email}
                    </div>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">
                    {order.date}
                  </TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} format="raw" />
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {order.amount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
