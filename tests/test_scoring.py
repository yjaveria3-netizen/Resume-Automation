import pytest
from pathlib import Path
from services.scoring import compute_ats_score
from tests.fixtures.resume_fixtures import (
    create_weak_resume_1,
    create_weak_resume_2,
    create_weak_resume_3,
    create_average_resume_1,
    create_average_resume_2,
    create_average_resume_3,
    create_strong_resume_1,
    create_strong_resume_2,
    create_strong_resume_3,
    create_keyword_stuffed_resume,
    create_numbers_only_resume,
)


def test_weak_resumes_land_below_50(tmp_path):
    """3 weak resumes must score strictly < 50 and label 'Needs Work'."""
    w1 = tmp_path / "weak_1.docx"
    w2 = tmp_path / "weak_2.docx"
    w3 = tmp_path / "weak_3.docx"

    create_weak_resume_1(w1)
    create_weak_resume_2(w2)
    create_weak_resume_3(w3)

    r1 = compute_ats_score(str(w1))
    r2 = compute_ats_score(str(w2))
    r3 = compute_ats_score(str(w3))

    for r, name in [(r1, "weak_1"), (r2, "weak_2"), (r3, "weak_3")]:
        assert r["score"] < 50, f"Expected {name} < 50, got {r['score']}"
        assert r["score_label"] == "Needs Work"
        assert set(r["breakdown"].keys()) == {"action_verbs", "metrics", "tech_stack", "structure"}
        assert isinstance(r["suggestions"], list)
        assert isinstance(r["offending_lines"], list)


def test_average_resumes_land_in_60_to_75(tmp_path):
    """3 average resumes must land between 60 and 75 and label 'Good'."""
    a1 = tmp_path / "avg_1.docx"
    a2 = tmp_path / "avg_2.docx"
    a3 = tmp_path / "avg_3.docx"

    create_average_resume_1(a1)
    create_average_resume_2(a2)
    create_average_resume_3(a3)

    r1 = compute_ats_score(str(a1))
    r2 = compute_ats_score(str(a2))
    r3 = compute_ats_score(str(a3))

    for r, name in [(r1, "avg_1"), (r2, "avg_2"), (r3, "avg_3")]:
        assert 60 <= r["score"] <= 75, f"Expected {name} in 60-75, got {r['score']}"
        assert r["score_label"] == "Good"


def test_strong_resumes_land_in_85_to_95(tmp_path):
    """3 strong resumes must land between 85 and 95 (none 100)."""
    st1 = tmp_path / "strong_1.docx"
    st2 = tmp_path / "strong_2.docx"
    st3 = tmp_path / "strong_3.docx"

    create_strong_resume_1(st1)
    create_strong_resume_2(st2)
    create_strong_resume_3(st3)

    r1 = compute_ats_score(str(st1))
    r2 = compute_ats_score(str(st2))
    r3 = compute_ats_score(str(st3))

    for r, name in [(r1, "strong_1"), (r2, "strong_2"), (r3, "strong_3")]:
        assert 85 <= r["score"] <= 95, f"Expected {name} in 85-95, got {r['score']}"
        assert r["score"] < 100
        assert r["score_label"] in ("Strong", "Exceptional")


def test_ordering_strong_greater_than_average_greater_than_weak(tmp_path):
    """Strict monotonicity across all 9: min(strong) > max(average) > max(weak)."""
    ws = [tmp_path / f"w_{i}.docx" for i in range(3)]
    avgs = [tmp_path / f"a_{i}.docx" for i in range(3)]
    strs = [tmp_path / f"s_{i}.docx" for i in range(3)]

    create_weak_resume_1(ws[0])
    create_weak_resume_2(ws[1])
    create_weak_resume_3(ws[2])

    create_average_resume_1(avgs[0])
    create_average_resume_2(avgs[1])
    create_average_resume_3(avgs[2])

    create_strong_resume_1(strs[0])
    create_strong_resume_2(strs[1])
    create_strong_resume_3(strs[2])

    w_scores = [compute_ats_score(str(p))["score"] for p in ws]
    a_scores = [compute_ats_score(str(p))["score"] for p in avgs]
    s_scores = [compute_ats_score(str(p))["score"] for p in strs]

    assert min(s_scores) > max(a_scores) > max(w_scores)


def test_keyword_stuffed_junk_resume_below_50(tmp_path):
    """Keyword stuffing junk resume must score < 50."""
    p = tmp_path / "stuffed.docx"
    create_keyword_stuffed_resume(p)
    score = compute_ats_score(str(p))["score"]
    assert score < 50, f"Expected keyword stuffed < 50, got {score}"


def test_numbers_only_junk_resume_below_40(tmp_path):
    """Numbers only junk resume (years, phones) must score < 40."""
    p = tmp_path / "numbers.docx"
    create_numbers_only_resume(p)
    res = compute_ats_score(str(p))
    assert res["score"] < 40, f"Expected numbers-only < 40, got {res['score']}"
    assert res["breakdown"]["metrics"] == 0, "Years and phone numbers must not count as metrics"


def test_score_determinism(tmp_path):
    """Same input document must produce byte-for-byte identical score and breakdown."""
    p = tmp_path / "det.docx"
    create_strong_resume_1(p)
    res1 = compute_ats_score(str(p))
    res2 = compute_ats_score(str(p))
    assert res1 == res2
