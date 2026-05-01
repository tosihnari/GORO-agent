"""
GORO HP 月間アクセス数レポート
GA4 Property ID: 374023474
"""

import os
import requests
from google.analytics.data_v1beta import BetaAnalyticsDataClient
from google.analytics.data_v1beta.types import (
    DateRange,
    Dimension,
    Metric,
    RunReportRequest,
)
from google_auth_oauthlib.flow import InstalledAppFlow
from google.auth.transport.requests import Request
import google.oauth2.credentials
import json

PROPERTY_ID = "374023474"
CREDENTIALS_DIR = os.path.join(os.path.dirname(__file__), "credentials")
CLIENT_SECRETS = os.path.join(CREDENTIALS_DIR, "client_secrets.json")
TOKEN_FILE = os.path.join(CREDENTIALS_DIR, "token.json")
SCOPES = [
    "https://www.googleapis.com/auth/analytics.readonly",
    "https://www.googleapis.com/auth/webmasters.readonly",
]


def get_credentials():
    creds = None
    if os.path.exists(TOKEN_FILE):
        with open(TOKEN_FILE) as f:
            creds = google.oauth2.credentials.Credentials.from_authorized_user_info(
                json.load(f), SCOPES
            )
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            flow = InstalledAppFlow.from_client_secrets_file(CLIENT_SECRETS, SCOPES)
            creds = flow.run_local_server(port=0)
        with open(TOKEN_FILE, "w") as f:
            f.write(creds.to_json())
    return creds


def monthly_report(client):
    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="yearMonth")],
        metrics=[
            Metric(name="sessions"),
            Metric(name="totalUsers"),
            Metric(name="screenPageViews"),
        ],
        date_ranges=[DateRange(start_date="2025-01-01", end_date="today")],
        order_bys=[{"dimension": {"dimension_name": "yearMonth"}}],
    )
    response = client.run_report(request)

    print(f"{'月':<8} {'セッション':>10} {'ユーザー数':>10} {'PV数':>10}")
    print("-" * 42)
    for row in response.rows:
        ym = row.dimension_values[0].value
        sessions = row.metric_values[0].value
        users = row.metric_values[1].value
        pageviews = row.metric_values[2].value
        label = f"{ym[:4]}/{ym[4:]}"
        print(f"{label:<8} {int(sessions):>10,} {int(users):>10,} {int(pageviews):>10,}")


def keyword_report(client):
    request = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="searchTerm")],
        metrics=[Metric(name="sessions")],
        date_ranges=[DateRange(start_date="2025-01-01", end_date="today")],
        order_bys=[{"metric": {"metric_name": "sessions"}, "desc": True}],
        limit=10,
    )
    response = client.run_report(request)

    print(f"\n{'検索キーワード TOP10 (2025/01〜今日)':}")
    print("-" * 42)
    for i, row in enumerate(response.rows, 1):
        keyword = row.dimension_values[0].value
        sessions = int(row.metric_values[0].value)
        print(f"{i:>2}. {keyword:<30} {sessions:>6,} セッション")


def search_console_keywords(creds, site_url="sc-domain:studio-goro.com"):
    token = creds.token
    url = f"https://www.googleapis.com/webmasters/v3/sites/{requests.utils.quote(site_url, safe='')}/searchAnalytics/query"
    payload = {
        "startDate": "2025-01-01",
        "endDate": "2026-03-31",
        "dimensions": ["query"],
        "rowLimit": 10,
        "orderBy": [{"fieldName": "clicks", "sortOrder": "DESCENDING"}],
    }
    resp = requests.post(url, json=payload, headers={"Authorization": f"Bearer {token}"})
    data = resp.json()

    if "rows" not in data:
        print("データなし。サイトURLを確認してください。")
        print(data)
        return

    print(f"\n{'検索キーワード TOP10 (2025/01〜2026/03)':}")
    print("-" * 52)
    print(f"{'':>3} {'キーワード':<30} {'クリック':>8} {'表示':>8} {'CTR':>6}")
    print("-" * 52)
    for i, row in enumerate(data["rows"], 1):
        query = row["keys"][0]
        clicks = int(row["clicks"])
        impressions = int(row["impressions"])
        ctr = f"{row['ctr']*100:.1f}%"
        print(f"{i:>2}. {query:<30} {clicks:>8,} {impressions:>8,} {ctr:>6}")


def column_conversion_report(client):
    from google.analytics.data_v1beta.types import (
        OrderBy, FilterExpression, Filter, FilterExpressionList
    )

    date_range = DateRange(start_date="2025-01-01", end_date="today")

    # 1. コラムページの総セッション数
    col_req = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="pagePath")],
        metrics=[Metric(name="sessions")],
        date_ranges=[date_range],
        dimension_filter=FilterExpression(
            filter=Filter(
                field_name="pagePath",
                string_filter=Filter.StringFilter(
                    match_type=Filter.StringFilter.MatchType.BEGINS_WITH,
                    value="/column/",
                ),
            )
        ),
        limit=200,
    )
    col_resp = client.run_report(col_req)
    total_column_sessions = sum(int(r.metric_values[0].value) for r in col_resp.rows)

    # 2. /contact への流入でreferrerがコラムページのもの
    contact_req = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="pageReferrer")],
        metrics=[Metric(name="screenPageViews")],
        date_ranges=[date_range],
        dimension_filter=FilterExpression(
            and_group=FilterExpressionList(
                expressions=[
                    FilterExpression(
                        filter=Filter(
                            field_name="pagePath",
                            string_filter=Filter.StringFilter(
                                match_type=Filter.StringFilter.MatchType.EXACT,
                                value="/contact",
                            ),
                        )
                    ),
                    FilterExpression(
                        filter=Filter(
                            field_name="pageReferrer",
                            string_filter=Filter.StringFilter(
                                match_type=Filter.StringFilter.MatchType.CONTAINS,
                                value="/column/",
                            ),
                        )
                    ),
                ]
            )
        ),
        limit=200,
    )
    contact_resp = client.run_report(contact_req)
    column_to_contact = sum(int(r.metric_values[0].value) for r in contact_resp.rows)

    # 3. /thanks への流入でreferrerが /contact のもの（コラム起点）
    # コラム→contact→thanksの完全コンバージョンはGA4 APIでは直接取れないため
    # /thanks の全セッション数をコンバージョン数として使用
    thanks_req = RunReportRequest(
        property=f"properties/{PROPERTY_ID}",
        dimensions=[Dimension(name="pagePath")],
        metrics=[Metric(name="sessions")],
        date_ranges=[date_range],
        dimension_filter=FilterExpression(
            filter=Filter(
                field_name="pagePath",
                string_filter=Filter.StringFilter(
                    match_type=Filter.StringFilter.MatchType.EXACT,
                    value="/thanks",
                ),
            )
        ),
    )
    thanks_resp = client.run_report(thanks_req)
    total_thanks = sum(int(r.metric_values[0].value) for r in thanks_resp.rows)

    # 結果表示
    contact_rate = (column_to_contact / total_column_sessions * 100) if total_column_sessions else 0

    print("\n■ コラム記事 → お問い合わせ/資料DL 遷移率レポート (2025/01〜今日)")
    print("=" * 50)
    print(f"  コラムページ 総セッション数 :  {total_column_sessions:>8,}")
    print(f"  コラム → /contact 直接遷移  :  {column_to_contact:>8,}")
    print(f"  /thanks (全CV完了数)         :  {total_thanks:>8,}")
    print("-" * 50)
    print(f"  コラム → お問い合わせ 遷移率 :  {contact_rate:>7.2f}%")
    print()
    print("  ※ 遷移率 = コラムから直接/contactへ移動した回数 / コラム総セッション")
    print("  ※ コラム→他ページ→contactのような多段遷移は含まれません")


def list_accessible_properties(creds):
    token = creds.token
    resp = requests.get(
        "https://analyticsadmin.googleapis.com/v1beta/accountSummaries?pageSize=200",
        headers={"Authorization": f"Bearer {token}"},
    )
    data = resp.json()

    if "accountSummaries" not in data:
        print("アクセス可能なアカウントが見つかりませんでした。")
        print(data)
        return

    print("\n■ アクセス可能なGA4アカウント・プロパティ一覧")
    print("=" * 60)
    for account in data["accountSummaries"]:
        print(f"\nアカウント: {account.get('displayName')}  ({account.get('account')})")
        for prop in account.get("propertySummaries", []):
            prop_id = prop.get("property", "").replace("properties/", "")
            print(f"  └ [{prop_id}] {prop.get('displayName')}")


def monthly_pv(client, property_id, label):
    request = RunReportRequest(
        property=f"properties/{property_id}",
        dimensions=[Dimension(name="yearMonth")],
        metrics=[Metric(name="screenPageViews"), Metric(name="sessions"), Metric(name="totalUsers")],
        date_ranges=[DateRange(start_date="2026-01-01", end_date="today")],
        order_bys=[{"dimension": {"dimension_name": "yearMonth"}}],
    )
    response = client.run_report(request)
    print(f"\n■ {label}  (ID: {property_id})")
    print(f"  {'月':<8} {'PV数':>10} {'セッション':>10} {'ユーザー':>10}")
    print("  " + "-" * 42)
    for row in response.rows:
        ym = row.dimension_values[0].value
        pv = int(row.metric_values[0].value)
        sessions = int(row.metric_values[1].value)
        users = int(row.metric_values[2].value)
        label_m = f"{ym[:4]}/{ym[4:]}"
        print(f"  {label_m:<8} {pv:>10,} {sessions:>10,} {users:>10,}")


def run_report():
    creds = get_credentials()
    client = BetaAnalyticsDataClient(credentials=creds)

    targets = [
        ("349442447", "Photoruction - GA4（メインサービス）"),
        ("404788504", "Photoruction - ServiceLP"),
        ("350712283", "Photoruction_Corp（コーポレート）"),
    ]
    print("\nフォトラクション 直近3ヶ月 月間PVレポート (2026/01〜今日)")
    print("=" * 50)
    for prop_id, label in targets:
        try:
            monthly_pv(client, prop_id, label)
        except Exception as e:
            print(f"\n■ {label}: 取得失敗 ({e})")


if __name__ == "__main__":
    run_report()
