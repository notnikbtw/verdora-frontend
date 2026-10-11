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
import AdminSectionHeader from '@components/common/section/AdminSectionHeader';
import { useGetAllUsers } from '@api/user/user.hooks';
import { useAllCategories } from '@api/category/category.hooks';
import { Spinner } from '@components/ui/spinner';
import { ChartBarStacked, CreditCard, DollarSign, Users } from 'lucide-react';
import {
  DashboardMetricCard,
  DashboardMetricCardSkeleton,
} from '@components/common/cards/DashboardMetricCard';
import { useMemo, useState } from 'react';
import { useAllOrders } from '@api/order/order.hooks';
import { useRevenueReport } from '@api/report/report.hooks';
import {
  formatOrderDate,
  formatOrderPrice,
  sortOrdersNewestFirst,
} from '@/utils/order.utils';
import { getRecentRange } from '@/utils/report.utils';
import { REVENUE_RANGE_DAYS } from '@/config/report.config';
import { RECENT_ORDERS_COUNT, SALE_STATUSES } from '@/config/dashboard.config';
import { Skeleton } from '@components/ui/skeleton';

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

  const {
    data: orders,
    isPending: ordersPending,
    isError: ordersError,
  } = useAllOrders();

  const range = useMemo(() => getRecentRange(), []);
  const {
    data: revenueData,
    isPending: revenuePending,
    isError: revenueError,
  } = useRevenueReport({
    dateFrom: range.from,
    dateTo: range.to,
    groupBy: 'DAY',
  });

  const totalRevenue = revenueData?.reduce((sum, r) => sum + r.revenue, 0);

  const salesCount = useMemo(() => {
    const since = new Date(`${range.from}T00:00:00`).getTime();
    return orders?.filter(
      o =>
        SALE_STATUSES.includes(o.status) &&
        new Date(o.createdAt).getTime() >= since
    ).length;
  }, [orders, range.from]);

  const recentOrders = useMemo(
    () =>
      orders ? sortOrdersNewestFirst(orders).slice(0, RECENT_ORDERS_COUNT) : [],
    [orders]
  );

  return (
    <AdminLayout>
      <AdminSectionHeader
        title="Dashboard"
        description="Overview of your store's performance."
      />

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {revenuePending ? (
          <DashboardMetricCardSkeleton />
        ) : (
          <DashboardMetricCard
            value={formatOrderPrice(totalRevenue)}
            title="Total Revenue"
            description={`Last ${REVENUE_RANGE_DAYS} days`}
            icon={DollarSign}
            error={revenueError}
            errorMessage="Failed to load revenue. Please try again later."
          />
        )}
        {ordersPending ? (
          <DashboardMetricCardSkeleton />
        ) : (
          <DashboardMetricCard
            value={salesCount?.toString() ?? 'N/A'}
            title="Sales"
            description={`Paid orders in the last ${REVENUE_RANGE_DAYS} days`}
            icon={CreditCard}
            error={ordersError}
            errorMessage="Failed to load orders. Please try again later."
          />
        )}
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
            value={
              Array.isArray(categoriesData)
                ? categoriesData.length.toString()
                : 'N/A'
            }
            title="Total Categories"
            description={
              Array.isArray(categoriesData)
                ? 'Number of categories'
                : 'No category data'
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
                  <TableHead className="w-[100px] sm:w-[120px]">ID</TableHead>
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
            The latest {RECENT_ORDERS_COUNT} orders placed in your store.
          </CardDescription>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          {ordersPending ? (
            <div className="space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : ordersError ? (
            <NoticeAlert
              variant="error"
              message="Failed to load orders. Please try again later."
            />
          ) : recentOrders.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No orders have been placed yet.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px] sm:w-[120px]">
                    Order
                  </TableHead>
                  <TableHead className="hidden sm:table-cell">Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentOrders.map(order => (
                  <TableRow key={order.orderId}>
                    <TableCell className="font-medium">
                      #{order.orderId}
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">
                      {formatOrderDate(order.createdAt)}
                    </TableCell>
                    <TableCell>
                      <OrderStatusBadge status={order.status} />
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatOrderPrice(order.totalPrice)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </AdminLayout>
  );
};

export default AdminDashboard;
