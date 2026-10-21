"""Large numeric port arguments must be rejected before any TCP probe."""

from __future__ import annotations

import os
import subprocess
from pathlib import Path

import pytest

SCRIPT = Path(__file__).resolve().parents[2] / "scripts" / "wait-for-port.sh"


@pytest.mark.skipif(os.name == "nt", reason="POSIX executable probe stub")
@pytest.mark.parametrize("port", ["999999999999999999999999999999999999", "000000000000000000000000000000099999999999999999999"])
def test_overflow_port_is_rejected_before_probe(tmp_path: Path, port: str) -> None:
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    marker = tmp_path / "probed"
    lsof = bin_dir / "lsof"
    lsof.write_text('#!/bin/sh\nprintf x >> "$PROBE_MARKER"\nexit 0\n', encoding="utf-8", newline="\n")
    lsof.chmod(0o755)
    env = {**os.environ, "PATH": f"{bin_dir}:/usr/bin:/bin", "PROBE_MARKER": str(marker)}

    result = subprocess.run(["bash", str(SCRIPT), port, "0", "Test service"], env=env, capture_output=True, text=True, timeout=5)

    assert result.returncode == 1
    assert "Port must be between 1 and 65535" in result.stderr
    assert not marker.exists()


@pytest.mark.skipif(os.name == "nt", reason="POSIX executable probe stub")
@pytest.mark.parametrize("port", ["1", "65535", "00080"])
def test_valid_port_is_probed(tmp_path: Path, port: str) -> None:
    bin_dir = tmp_path / "bin"
    bin_dir.mkdir()
    marker = tmp_path / "probed"
    lsof = bin_dir / "lsof"
    lsof.write_text('#!/bin/sh\nprintf x >> "$PROBE_MARKER"\nexit 0\n', encoding="utf-8", newline="\n")
    lsof.chmod(0o755)
    env = {**os.environ, "PATH": f"{bin_dir}:/usr/bin:/bin", "PROBE_MARKER": str(marker)}

    result = subprocess.run(["bash", str(SCRIPT), port, "0", "Test service"], env=env, capture_output=True, text=True, timeout=5)

    assert result.returncode == 0, result.stderr
    assert marker.read_text(encoding="utf-8") == "x"
